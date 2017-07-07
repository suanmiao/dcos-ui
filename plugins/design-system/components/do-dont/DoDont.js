import classNames from "classnames/dedupe";
import React, { Component } from "react";

class DoDont extends Component {
  getTitle() {
    const { isDo } = this.props;
    if (isDo) {
      return "Do";
    }

    return "Don't";
  }

  render() {
    const { className, description, isDo } = this.props;
    const classes = classNames("do-dont-container", className);
    const colorClasses = {
      red: !isDo,
      green: isDo
    };

    const dividerClasses = classNames("do-dont-divider", colorClasses);
    const titleClasses = classNames("do-dont-title", colorClasses);

    return (
      <div className={classes}>
        <div className={dividerClasses} />
        <div className={titleClasses}>
          {this.getTitle()}
        </div>
        <div className="do-dont-desc">
          {description}
        </div>
        {this.props.children}
      </div>
    );
  }
}

DoDont.propTypes = {
  isDo: React.PropTypes.bool.isRequired,
  description: React.PropTypes.string.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = DoDont;
