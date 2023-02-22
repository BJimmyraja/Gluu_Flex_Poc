import json
import logging.config
import os
from uuid import uuid4
from functools import cached_property

from jans.pycloudlib import get_manager
from jans.pycloudlib.utils import get_random_chars
from jans.pycloudlib.utils import encode_text
from jans.pycloudlib.persistence import CouchbaseClient
from jans.pycloudlib.persistence import LdapClient
from jans.pycloudlib.persistence import SpannerClient
from jans.pycloudlib.persistence import SqlClient
from jans.pycloudlib.persistence import doc_id_from_dn
from jans.pycloudlib.persistence import id_from_dn
from jans.pycloudlib.persistence.utils import PersistenceMapper

from settings import LOGGING_CONFIG

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("entrypoint")


def render_env(manager):
    hostname = manager.config.get("hostname")
    ctx = {
        "hostname": hostname,
    }

    with open("/app/templates/env.tmpl") as fr:
        txt = fr.read() % ctx

    with open("/opt/flex/admin-ui/.env", "w") as fw:
        fw.write(txt)


def render_nginx_conf(manager):
    with open("/app/templates/nginx-default.conf.tmpl") as fr:
        ctx = {
            "hostname": manager.config.get("hostname"),
        }
        txt = fr.read() % ctx

    with open("/etc/nginx/http.d/default.conf", "w") as fw:
        fw.write(txt)


def main():
    manager = get_manager()

    # if not os.path.isfile("/etc/certs/web_https.crt"):
    #     manager.secret.to_file("ssl_cert", "/etc/certs/web_https.crt")

    # if not os.path.isfile("/etc/certs/web_https.key"):
    #     manager.secret.to_file("ssl_key", "/etc/certs/web_https.key")

    render_env(manager)
    render_nginx_conf(manager)

    persistence_setup = PersistenceSetup(manager)
    persistence_setup.import_ldif_files()
    persistence_setup.save_config()


def read_from_file(path):
    txt = ""
    try:
        with open(path) as f:
            txt = f.read()
    except FileNotFoundError:
        logger.warning(f"Unable to read {path} file; fallback to empty string")
    return txt.strip()


class PersistenceSetup:
    def __init__(self, manager):
        self.manager = manager

        client_classes = {
            "ldap": LdapClient,
            "couchbase": CouchbaseClient,
            "spanner": SpannerClient,
            "sql": SqlClient,
        }

        # determine persistence type
        mapper = PersistenceMapper()
        self.persistence_type = mapper.mapping["default"]

        # determine persistence client
        client_cls = client_classes.get(self.persistence_type)
        self.client = client_cls(manager)

    def get_token_server_ctx(self):
        hostname = os.environ.get("CN_TOKEN_SERVER_BASE_HOSTNAME") or self.manager.config.get("hostname")
        authz_endpoint = os.environ.get("CN_TOKEN_SERVER_AUTHZ_ENDPOINT") or "/jans-auth/restv1/authorize"
        token_endpoint = os.environ.get("CN_TOKEN_SERVER_TOKEN_ENDPOINT") or "/jans-auth/restv1/token"
        introspection_endpoint = os.environ.get("CN_TOKEN_SERVER_INTROSPECTION_ENDPOINT") or "/jans-auth/restv1/introspection"
        userinfo_endpoint = os.environ.get("CN_TOKEN_SERVER_USERINFO_ENDPOINT") or "/jans-auth/restv1/userinfo"

        pw_file = "/etc/jans/conf/token_server_client_secret"
        if not os.path.isfile(pw_file):
            self.manager.secret.to_file("token_server_admin_ui_client_pw", pw_file)

        ctx = {
            "token_server_admin_ui_client_id": os.environ.get("CN_TOKEN_SERVER_CLIENT_ID") or self.manager.config.get("token_server_admin_ui_client_id"),
            "token_server_admin_ui_client_pw": read_from_file(pw_file),
            "token_server_authz_url": f"https://{hostname}{authz_endpoint}",
            "token_server_token_url": f"https://{hostname}{token_endpoint}",
            "token_server_introspection_url": f"https://{hostname}{introspection_endpoint}",
            "token_server_userinfo_url": f"https://{hostname}{userinfo_endpoint}",
        }
        return ctx

    @cached_property
    def ctx(self):
        salt = self.manager.secret.get("encoded_salt")

        ctx = {
            "hostname": self.manager.config.get("hostname"),
            "admin_ui_auth_method": os.environ.get("GLUU_ADMIN_UI_AUTH_METHOD", "basic"),
        }

        # admin-ui client for auth server
        ctx["admin_ui_client_id"] = self.manager.config.get("admin_ui_client_id")
        if not ctx["admin_ui_client_id"]:
            ctx["admin_ui_client_id"] = f"1901.{uuid4()}"
            self.manager.config.set("admin_ui_client_id", ctx["admin_ui_client_id"])

        ctx["admin_ui_client_pw"] = self.manager.secret.get("admin_ui_client_pw")
        if not ctx["admin_ui_client_pw"]:
            ctx["admin_ui_client_pw"] = get_random_chars()
            self.manager.secret.set("admin_ui_client_pw", ctx["admin_ui_client_pw"])

        ctx["admin_ui_client_encoded_pw"] = self.manager.secret.get("admin_ui_client_encoded_pw")
        if not ctx["admin_ui_client_encoded_pw"]:
            ctx["admin_ui_client_encoded_pw"] = encode_text(ctx["admin_ui_client_pw"], salt).decode()
            self.manager.secret.set("admin_ui_client_encoded_pw", ctx["admin_ui_client_encoded_pw"])

        # admin-ui client for token server
        ctx["token_server_admin_ui_client_id"] = self.manager.config.get("token_server_admin_ui_client_id")
        if not ctx["token_server_admin_ui_client_id"]:
            ctx["token_server_admin_ui_client_id"] = f"1901.{uuid4()}"
            self.manager.config.set("token_server_admin_ui_client_id", ctx["token_server_admin_ui_client_id"])

        ctx["token_server_admin_ui_client_pw"] = self.manager.secret.get("token_server_admin_ui_client_pw")
        if not ctx["token_server_admin_ui_client_pw"]:
            ctx["token_server_admin_ui_client_pw"] = get_random_chars()
            self.manager.secret.set("token_server_admin_ui_client_pw", ctx["token_server_admin_ui_client_pw"])

        ctx["token_server_admin_ui_client_encoded_pw"] = self.manager.secret.get("token_server_admin_ui_client_encoded_pw")
        if not ctx["token_server_admin_ui_client_encoded_pw"]:
            ctx["token_server_admin_ui_client_encoded_pw"] = encode_text(ctx["token_server_admin_ui_client_pw"], salt).decode()
            self.manager.secret.set("token_server_admin_ui_client_encoded_pw", ctx["token_server_admin_ui_client_encoded_pw"])

        ctx.update(self.get_token_server_ctx())

        # finalized contexts
        return ctx

    @cached_property
    def ldif_files(self):
        filenames = ["clients.ldif"]
        return [f"/app/templates/{filename}" for filename in filenames]

    def import_ldif_files(self):
        for file_ in self.ldif_files:
            logger.info(f"Importing {file_}")
            self.client.create_from_ldif(file_, self.ctx)

    def save_config(self):
        logger.info("Updating admin-ui config in persistence (if required).")

        with open("/app/templates/auiConfiguration.json") as f:
            conf_from_file = f.read() % self.ctx

        dn = "ou=admin-ui,ou=configuration,o=jans"

        if self.persistence_type in ("sql", "spanner"):
            dn = doc_id_from_dn(dn)
            table_name = "jansAppConf"

            entry = self.client.get(table_name, dn)

            if not entry["jansConfApp"]:
                entry["jansConfApp"] = conf_from_file
                entry["jansRevision"] += 1
                self.client.update(table_name, dn, entry)

        elif self.persistence_type == "couchbase":
            bucket = os.environ.get("CN_COUCHBASE_BUCKET_PREFIX", "jans")
            dn = id_from_dn(dn)

            req = self.client.exec_query(f"SELECT META().id, {bucket}.* FROM {bucket} USE KEYS '{dn}'")
            entry = req.json()["results"][0]

            conf = entry.get("jansConfApp") or {}
            if not conf:
                rev = entry["jansRevision"] + 1
                self.client.exec_query(f"UPDATE {bucket} USE KEYS '{dn}' SET jansConfApp={conf_from_file}, jansRevision={rev}")

        else:
            entry = self.client.get(dn)
            attrs = entry.entry_attributes_as_dict

            try:
                conf = attrs.get("jansConfApp", [])[0]
            except IndexError:
                conf = ""

            if not conf:
                self.client.modify(
                    dn,
                    {
                        "jansRevision": [(self.client.MODIFY_REPLACE, attrs["jansRevision"][0] + 1)],
                        "jansConfApp": [(self.client.MODIFY_REPLACE, conf_from_file)],
                    }
                )


if __name__ == "__main__":
    main()