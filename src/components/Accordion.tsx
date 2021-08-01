import React from "react";

import "@/scss/accordion.scss";

type AccordionProps = {
  isOpen: boolean;
  children: any;
};

type AccordionState = {
  className: string;
  height: number;
};

const InitialClassName = "accordion";

export class Accordion extends React.Component<AccordionProps, AccordionState> {
  constructor(props: AccordionProps) {
    super(props);

    let className = InitialClassName;
    if (!props.isOpen) {
      className += " mod-close";
    }
    this.state = {
      className: className,
      height: undefined,
    };
  }

  topElement: any;

  componentDidMount() {
    setTimeout(() => {
      this.setState({ height: this.topElement.scrollHeight });
    }, 100);
  }

  componentDidUpdate(prevProp: AccordionProps) {
    let className = InitialClassName;
    if (this.props.isOpen !== prevProp.isOpen) {
      if (!this.props.isOpen) {
        className += " mod-close";
      }
      this.setState({ className });
    }
  }

  render() {
    return (
      <div
        className={this.state.className}
        style={{ height: this.state.height }}
        ref={(elm) => (this.topElement = elm)}
      >
        {this.props.children}
      </div>
    );
  }
}
