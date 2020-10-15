import React, { Component } from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber, Row } from 'antd';
import i18n from 'i18next';
// #work example of form

class PropertyCompanyColor extends Component {
	renderColorItems = () => null;

	state = {
		defaultColors: [],
		changed: 0,
	};

	changeColorOfElement = color => {
		const { canvasRef, selectedItem } = this.props;
		const {changed} = this.state;
		const colors = [];

		// console.log('item(1) fill');
		// console.log(canvas.canvas.item(1)._objects[0].fill);
		// canvas.canvas.item(1)._objects[0].fill='gold';
		// console.log(canvas.canvas.item(1)._objects[0].fill);

		if (color === 'default') {
			selectedItem._objects.forEach((el, index) => {
				selectedItem._objects[index].fill = this.state.defaultColors[index];
			});

		} else {
			selectedItem._objects.forEach((el, index) => {
				// console.log(selectedItem._objects[index].fill)
				if (changed === 0) colors.push(selectedItem._objects[index].fill);
				selectedItem._objects[index].fill = color;
			});

			if (changed === 0) this.setState({ defaultColors: [...colors] });
			this.setState({ changed: 1 });
		}

		// Я хз почему, но без этой строки окрас не производится
		// I dont know why, but without this row, color will not change
		canvasRef.canvas._activeObject.set('scaleX', canvasRef.canvas._activeObject.scaleX + 0.000000000001);

		canvasRef.canvas.renderAll();
	};

	componentDidUpdate(oldProps) {
		if (oldProps.selectedItem !== this.props.selectedItem) {
			this.setState({ changed: 0 });
		}
	}

	render() {
		return (
			<div className="PropertyCompanyColor">
				<h5>Choose company color</h5>
				<ul>
					<li>
						<button
							disabled={this.state.changed === 0}
							onClick={() => this.changeColorOfElement('default')}
						>
							default
						</button>
					</li>
					<li>
						<button onClick={() => this.changeColorOfElement('red')}>red</button>
					</li>
					<li>
						<button onClick={() => this.changeColorOfElement('green')}>green</button>
					</li>
					<li>
						<button onClick={() => this.changeColorOfElement('blue')}>blue</button>
					</li>
				</ul>
			</div>
		);
	}
}

export default PropertyCompanyColor;
