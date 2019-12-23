import React, {Component} from "react";

export default class Tool extends Component {
  handleOnClick() {
    this.props.onSelect(this.props.toolId);
  }

  render() {
    return (
      <button
        onClick={this.handleOnClick.bind(this)}
        className='btn btn-primary btn-block'
        width= '100px'
        >
        {this.props.name}
      </button>
    );
  }
}
