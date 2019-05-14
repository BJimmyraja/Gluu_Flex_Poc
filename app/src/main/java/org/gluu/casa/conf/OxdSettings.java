/*
 * cred-manager is available under the MIT License (2008). See http://opensource.org/licenses/MIT for full text.
 *
 * Copyright (c) 2017, Gluu
 */
package org.gluu.casa.conf;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * @author jgomer
 */
public class OxdSettings {

    private String host;
    private int port;

    @JsonProperty("authz_redirect_uri")
    private String redirectUri;

    @JsonProperty("post_logout_uri")
    private String postLogoutUri;

    @JsonProperty("frontchannel_logout_uri")
    private String frontLogoutUri;

    @JsonProperty("client")
    private OxdClientSettings client;

    @JsonIgnore
    private String opHost;

    @JsonIgnore
    private List<String> acrValues;

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public String getPostLogoutUri() {
        return postLogoutUri;
    }

    public String getOpHost() {
        return opHost;
    }

    public List<String> getAcrValues() {
        return acrValues;
    }

    public String getFrontLogoutUri() {
        return frontLogoutUri;
    }

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public OxdClientSettings getClient() {
        return client;
    }

    public void setOpHost(String opHost) {
        this.opHost = opHost;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public void setPostLogoutUri(String postLogoutUri) {
        this.postLogoutUri = postLogoutUri;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public void setAcrValues(List<String> acrValues) {
        this.acrValues = acrValues;
    }

    public void setClient(OxdClientSettings client) {
        this.client = client;
    }

    public void setFrontLogoutUri(String frontLogoutUri) {
        this.frontLogoutUri = frontLogoutUri;
    }

}
