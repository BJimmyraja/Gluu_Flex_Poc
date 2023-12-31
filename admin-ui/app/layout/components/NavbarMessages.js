import React from "react"
import _ from "lodash"
import PropTypes from "prop-types"

import {
  Avatar,
  UncontrolledDropdown,
  DropdownToggle,
  IconWithBadge,
  Badge,
  ExtendedDropdown,
  ListGroup,
  ListGroupItem,
  Media,
  InputGroup,
  Input,
  InputGroupAddon,
  Button
} from "Components"

const messagesColors = ["text-success", "text-danger", "text-warning"]

const NavbarMessages = props => (
  <UncontrolledDropdown nav inNavbar {...props}>
    <DropdownToggle nav>
      <IconWithBadge
        badge={
          <Badge pill color="white">
            1
          </Badge>
        }
      >
        <i className="fa fa-envelope-o fa-fw" style={{ color: 'white' }} />
      </IconWithBadge>
    </DropdownToggle>
    <ExtendedDropdown right>
      <ExtendedDropdown.Section className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Messages</h6>
        <ExtendedDropdown.Link to="/apps/new-email">
          <i className="fa fa-pencil" />
        </ExtendedDropdown.Link>
      </ExtendedDropdown.Section>
      <ExtendedDropdown.Section>
        <InputGroup>
          <Input placeholder="Search Messages..." />
          <InputGroupAddon addonType="append">
            <Button color="secondary" outline>
              <i className="fa fa-search" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </ExtendedDropdown.Section>
      <ExtendedDropdown.Section list>
        <ListGroup>
          {_.times(1, index => (
            <ListGroupItem
              tag={ExtendedDropdown.Link}
              to="/apps/email-details"
              key={index}
              action
            >
              <Media>
                <Media left>
                  <Avatar.Image src="admin/static/logo.png" className="me-4" />
                </Media>
                <Media body>
                  <span className="d-flex justify-content-start">
                    <i
                      className={`fa fa-circle small ${messagesColors[index]} me-2 d-flex align-items-center`}
                    />
                    <span className="h6 pb-0 mb-0 d-flex align-items-center">
                      {"faker.name.firstName()"}
                    </span>

                    <span className="ms-1 small">(23)</span>
                    <span className="ms-auto small">Now</span>
                  </span>
                  <p className="mt-2 mb-1">{"faker.lorem.sentences()"}</p>
                </Media>
              </Media>
            </ListGroupItem>
          ))}
        </ListGroup>
      </ExtendedDropdown.Section>
      <ExtendedDropdown.Section
        className="text-center"
        tag={ExtendedDropdown.Link}
        to="/apps/inbox"
      >
        View All
        <i className="fa fa-angle-right fa-fw ms-2" />
      </ExtendedDropdown.Section>
    </ExtendedDropdown>
  </UncontrolledDropdown>
)
NavbarMessages.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
}

export { NavbarMessages }
