import {Route, Redirect} from 'react-router';

let pendingRoutes = [];

class PendingRoute {
  constructor(path, component) {
    this.path = path;
    this.component = component;
  }
  getFullPath() {
    return this.path;
  }
}

class PendingPageRoute extends PendingRoute {
  resolve(routes) {
    const existingRoute = routes.includes(this.path);

    if (existingRoute && existingRoute.component === this.component) {
      return existingRoute;
    } else if (existingRoute) {
      throw new Error(`Attempt to override a page at ${this.path}!`);
    }

    const newRoute = {
      type: Route,
      path: this.path,
      component: this.component
    };

    routes.push(newRoute);

    return newRoute;
  }
}

class PendingTabRoute extends PendingRoute {
  constructor(path, tabPath, component) {
    super(path, component);
    this.tabPath = tabPath;
  }
  getFullPath() {
    return `${this.path}/${this.tabPath}`;
  }
  resolve(routes) {
    const parent = routes.find(({path}) => path === this.path);

    if (!parent) {
      return null;
    }

    if (!parent.children) {
      parent.children = [];
    }

    const existingTab = parent.children.find(({path}) => path === this.tabPath);

    if (existingTab && existingTab.component === this.component) {
      return existingTab;
    } else if (existingTab) {
      throw new Error(`Attempt to override a tab at ${this.path}/${this.tabPath}!`);
    }

    const newTab = {
      type: Route,
      path: this.tabPath,
      component: this.component
    };

    parent.children.push(newTab);

    return newTab;
  }
}

class PendingRedirect extends PendingRoute {
  constructor(path, to) {
    super(path);
    this.to = to;
  }
  resolve(routes) {
    const existingRedirect = routes.find(({type, path}) => {
      return type === Redirect && path === this.path;
    });

    if (existingRedirect && existingRedirect.to === this.to) {
      return existingRedirect;
    } else if (existingRedirect) {
      throw new Error(`Attempt to override Redirect of ${this.path} from ${existingRedirect.to} to ${this.to}`);
    }

    routes.push({
      type: Redirect,
      path: this.path,
      to: this.to
    });
  }
}

const RoutingService = {
  registerPage(path, component, cb) {
    if (!component) {
      return cb(`Please provide a component for the new page ${path}!`);
    }

    pendingRoutes.push(new PendingPageRoute(path, component));
  },

  registerTab(path, tabPath, component, cb) {
    if (!component) {
      return cb(`Please provide a component for the new tab at ${pagePath}/${path}!`);
    }

    pendingRoutes.push(new PendingTabRoute(path, tabPath, component));
  },

  registerRedirect(path, to) {
    pendingRoutes.push(new PendingRedirect(path, to));
  },

  resolveWith(routes = []) {
    pendingRoutes.sort((routeA, routeB) => {
      const pathA = routeA.getFullPath();
      const pathB = routeB.getFullPath();

      if (pathA < pathB) {
        return -1;
      }
      if (pathA > pathB) {
        return 1;
      }
      return 0;
    });

    pendingRoutes = pendingRoutes.reduce((acc, route) => {
      if (!route.resolve(routes)) {
        acc.push(route);
      }

      return acc;
    }, []);
  }

};

export default RoutingService;
