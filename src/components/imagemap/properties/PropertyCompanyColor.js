import React, { Component } from 'react';
import { Form, Input, Slider, Switch, Col, InputNumber, Row } from 'antd';
import i18n from 'i18next';
// mocks
const mock_colors = ['red', 'green', 'blue'];
// color1_hex
import Cookies from 'universal-cookie';
class PropertyCompanyColor extends Component {
	renderColorItems = () => null;

	state = {
		defaultColors: [],
		changed: 0,
		choosedColor: null,
		colors: [],
	};

	changeColorOfElement = color => {
		const { canvasRef, selectedItem } = this.props;
		const { changed } = this.state;
		const colors = [];

		// console.log('item(1) fill');
		// console.log(canvas.canvas.item(1)._objects[0].fill);
		// canvas.canvas.item(1)._objects[0].fill='gold';
		// console.log(canvas.canvas.item(1)._objects[0].fill);

		if (color === 'default') {
			selectedItem._objects.forEach((el, index) => {
				selectedItem._objects[index].fill = this.state.defaultColors[index];
				this.setState({ choosedColor: 'default' });
			});
		} else {
			selectedItem._objects.forEach((el, index) => {
				// console.log(selectedItem._objects[index].fill)
				if (changed === 0) colors.push(selectedItem._objects[index].fill);
				selectedItem._objects[index].fill = color;
			});

			if (changed === 0) this.setState({ defaultColors: [...colors] });
			this.setState({ changed: 1, choosedColor: color });
		}

		// Я хз почему, но без этой строки окрас не производится
		// I dont know why, but without this row, color will not change
		canvasRef.canvas._activeObject.set('scaleX', canvasRef.canvas._activeObject.scaleX + 0.000000000001);

		canvasRef.canvas.renderAll();
	};

	renderColorButtons = arrayOfColors =>
		arrayOfColors
			.filter(color => color !== null && color !== undefined)
			.map((color, index) => (
				<li key={index + Math.random()} className={color === this.state.choosedColor ? 'active' : ''}>
					<button onClick={() => this.changeColorOfElement(color)} style={{ background: color }} />
				</li>
			));

	componentDidMount() {
		const cookies = new Cookies();
		const color1 = cookies.get('color1_hex');
		const color2 = cookies.get('color2_hex');
		const color3 = cookies.get('color3_hex');

		this.setState({ colors: [color1, color2, color3] });
	}

	componentDidUpdate(oldProps) {
		if (oldProps.selectedItem !== this.props.selectedItem) {
			this.setState({ changed: 0 });
		}
	}

	render() {
		return (
			<div className="PropertyCompanyColor">
				{this.renderColorButtons(this.state.colors).length ? <h5>Choose main color</h5> : null}
				{this.renderColorButtons(this.state.colors).length ? (
					<ul>
						<li className={'default' === this.state.choosedColor ? 'active' : ''}>
							<button
								disabled={this.state.changed === 0}
								onClick={() => this.changeColorOfElement('default')}
							/>
						</li>

						{this.renderColorButtons(this.state.colors)}
					</ul>
				) : null}
			</div>
		);
	}
}

export default PropertyCompanyColor;
