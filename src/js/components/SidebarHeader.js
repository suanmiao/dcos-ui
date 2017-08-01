import mixin from "reactjs-mixin";
import { MountService } from "foundation-ui";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import ClipboardTrigger from "./ClipboardTrigger";
import MetadataStore from "../stores/MetadataStore";
import MesosSummaryStore from "../stores/MesosSummaryStore";
import SidebarActions from "../events/SidebarActions";
import UserAccountDropdown from "./UserAccountDropdown";

const METHODS_TO_BIND = ["handleItemSelect", "handleTextCopy"];

const http = require("http");
const MasterClient = require("mesos-operator-api-client").masterClient;

class SidebarHeader extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isTextCopied: false
    };

    this.store_listeners = [
      {
        name: "metadata",
        events: ["success"],
        listenAlways: false
      },
      {
        name: "summary",
        events: ["success"],
        listenAlways: false
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    MountService.MountService.registerComponent(
      UserAccountDropdown,
      "Sidebar:UserAccountDropdown"
    );
  }

  getClusterName() {
    const states = MesosSummaryStore.get("states");
    let clusterName = null;

    if (states) {
      const lastState = states.lastSuccessful();

      if (lastState) {
        clusterName = lastState.getClusterName();
      }
    }

    return clusterName;
  }

  getPublicIP() {
    const metadata = MetadataStore.get("metadata");

    if (
      typeof metadata !== "object" ||
      metadata.PUBLIC_IPV4 == null ||
      metadata.PUBLIC_IPV4.length === 0
    ) {
      return null;
    }

    return metadata.PUBLIC_IPV4;
  }

  handleTextCopy() {
    this.setState({ isTextCopied: true });
  }

  handleItemSelect() {
    this.setState({ isTextCopied: false });
  }

  ping() {
    console.log("Pinging Get Health...");
    const options = {
      hostname: "localhost",
      port: 4200,
      path: "/mesos/api/v1",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Connection: "keep-alive"
      }
    };

    const postData = JSON.stringify({
      type: "GET_HEALTH"
    });

    const key = "RESPONSE";
    let start = new Date().getTime();
    const req = http.request(options, res => {
      console.log(`[${key}]: STATUS: ${res.statusCode}`);
      console.log(`[${key}]: HEADERS: ${JSON.stringify(res.headers)}`);
      res.on("data", chunk => {
        start = new Date().getTime();
        console.log(`[${key}]: ${chunk}`);
      });
      res.on("error", e => {
        console.error(`[${key}]: problem with response: ${e.message}`);
      });
      res.on("end", () => {
        const end = new Date().getTime();
        const diff = (end - start) / 1000;
        console.log(`[${key}]: Time elasped: ${diff} seconds`);
      });
    });

    req.on("error", e => {
      console.error(`[${key}]: problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
  }

  subscribe_client() {
    console.log("Subscribing via API...");
    const eventsClient = new MasterClient({
      masterHost: "localhost",
      masterPort: 4200,
      masterApiUri: "/mesos/api/v1"
    });

    // Wait for "subscribed" event
    eventsClient.on("subscribed", function() {
      console.log("Subscribed to the Mesos Operator API events!");
      // Call GET_AGENTS
      // eventsClient.getAgents(function(err, data) {
      //   console.log("Got result for GET_AGENTS");
      //   console.log(JSON.stringify(data));
      // });
      // Do a reconcile after 3000ms. Demo!
      // setTimeout(function() {
      //   eventsClient.reconcile();
      // }, 3000);
    });

    // Wait for "unsubscribed" event
    eventsClient.on("unsubscribed", function() {
      console.log("Unsubscribed from the Mesos Operator API events!");
    });

    // Catch error events
    eventsClient.on("error", function(errorObj) {
      console.log("Got an error");
      console.log(JSON.stringify(errorObj));
    });

    // Log SUBSCRIBED event
    eventsClient.on("SUBSCRIBED", function(eventObj) {
      console.log("Got SUBSCRIBED");
      console.log(JSON.stringify(eventObj));
    });

    // Log TASK_ADDED event
    eventsClient.on("TASK_ADDED", function(eventObj) {
      console.log("Got TASK_ADDED");
      console.log(JSON.stringify(eventObj));
    });

    // Log TASK_UPDATED event
    eventsClient.on("TASK_UPDATED", function(eventObj) {
      console.log("Got TASK_UPDATED");
      console.log(JSON.stringify(eventObj));
    });

    // Log AGENT_ADDED event
    eventsClient.on("AGENT_ADDED", function(eventObj) {
      console.log("Got AGENT_ADDED");
      console.log(JSON.stringify(eventObj));
    });

    // Log AGENT_REMOVED event
    eventsClient.on("AGENT_REMOVED", function(eventObj) {
      console.log("Got AGENT_REMOVED");
      console.log(JSON.stringify(eventObj));
    });

    // Subscribe to Mesos Operator API events
    eventsClient.subscribe();
  }

  subscribe(responseType) {
    console.log("Subscribing...");
    const options = {
      hostname: "localhost",
      port: 4200,
      path: "/mesos/api/v1",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${responseType}`,
        Connection: "keep-alive"
      }
    };

    const postData = JSON.stringify({
      type: "SUBSCRIBE"
    });

    const key = "RESPONSE";
    let start = new Date().getTime();
    let chunkCount = 1;
    let bytesRead = 0;
    const req = http.request(options, res => {
      console.log(`[${key}]: STATUS: ${res.statusCode}`);
      console.log(`[${key}]: HEADERS: ${JSON.stringify(res.headers)}`);
      res.on("data", chunk => {
        start = new Date().getTime();
        // console.log("object");
        // console.log("--");
        // console.log(chunk);
        // console.log("string");
        console.log(`-- CHUNK ${chunkCount} --`);
        console.log(`[${key}]: Size: ${chunk.length} bytes`);
        bytesRead = bytesRead + chunk.length;
        console.log(`[${key}]: Read so far: ${bytesRead} bytes`);
        const jsonResponse = `${chunk}`;
        console.log(`[${key}]: ${jsonResponse}`);
        // console.log("Converted back:");
        // console.log(ConvertString.stringToBytes(jsonResponse));
        chunkCount = chunkCount + 1;
      });
      res.on("error", e => {
        console.error(`[${key}]: ${key}: problem with response: ${e.message}`);
      });
      res.on("end", () => {
        const end = new Date().getTime();
        const diff = (end - start) / 1000;
        console.log(
          `[${key}]: Connection closed because idle for ${diff} seconds`
        );
      });
    });

    req.on("error", e => {
      console.error(`[${key}]: problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
  }

  render() {
    const clusterName = this.getClusterName();
    const copyText = this.state.isTextCopied ? "Copied" : "Copy";
    const publicIP = this.getPublicIP();
    const self = this;
    const menuItems = [
      {
        className: "dropdown-menu-section-header",
        html: <label className="text-overflow">{clusterName}</label>,
        id: "header-cluster-name",
        selectable: false
      },
      {
        className: "user-account-dropdown-menu-public-ip",
        html: (
          <ClipboardTrigger
            className="dropdown-menu-item-padding-surrogate clickable"
            copyText={publicIP}
            onTextCopy={this.handleTextCopy}
          >
            {publicIP}
            <span className="user-account-dropdown-menu-copy-text">
              {copyText}
            </span>
          </ClipboardTrigger>
        ),
        id: "public-ip",
        onClick: this.handleItemSelect
      },
      {
        html: "Overview",
        id: "overview",
        onClick: () => {
          SidebarActions.close();
          this.context.router.push("/overview");
        }
      },
      {
        className: "dropdown-menu-section-header",
        html: <label>Support</label>,
        id: "header-support",
        selectable: false
      },
      {
        html: "Documentation",
        id: "documentation",
        onClick() {
          SidebarActions.close();
          global.open(MetadataStore.buildDocsURI("/"), "_blank");
        }
      },
      {
        html: "Install CLI",
        id: "install-cli",
        onClick() {
          SidebarActions.close();
          SidebarActions.openCliInstructions();
        }
      },
      {
        html: "Subscribe JSON",
        id: "subscribe-json",
        onClick() {
          SidebarActions.close();
          self.subscribe("json");
        }
      },
      {
        html: "Subscribe Protobuf",
        id: "subscribe-protobuf",
        onClick() {
          SidebarActions.close();
          self.subscribe("x-protobuf");
        }
      },
      {
        html: "Subscribe via API",
        id: "subscribe-api",
        onClick() {
          SidebarActions.close();
          self.subscribe_client();
        }
      },
      {
        html: "Ping Health",
        id: "ping-health",
        onClick() {
          SidebarActions.close();
          self.ping();
        }
      }
    ];

    return (
      <header className="header flex-item-shrink-0">
        <MountService.Mount
          type="Sidebar:UserAccountDropdown"
          clusterName={this.getClusterName()}
          limit={1}
          menuItems={menuItems}
          onUpdate={this.props.onUpdate}
        />
      </header>
    );
  }
}

SidebarHeader.contextTypes = {
  router: routerShape
};

module.exports = SidebarHeader;
