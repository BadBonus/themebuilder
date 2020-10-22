import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';

class ColorPicker extends Component {
	static propTypes = {
		valueType: PropTypes.oneOf(['string', 'object']),
	};

	static defaultProps = {
		valueType: 'string',
	};

	handlers = {
		onChange: color => {
			const { onChange, valueType } = this.props;
			let newColor;
			if (valueType === 'string') {
				newColor = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
			} else {
				newColor = color.rgb;
			}
			this.setState(
				{
					color: newColor,
				},
				() => {
					onChange(newColor);
				},
			);
		},
	};

	state = {
		color: this.props.value || 'rgba(255, 255, 255, 1)',
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			color: nextProps.value || this.state.color,
		});
	}

	getBackgroundColor = color => {

		if (typeof color === 'string') {
			return color;
		}
		return `rgba(${color.r},${color.g},${color.b},${color.a})`;
	};

	rgb2hex(rgb){
		if (typeof color === 'string') {
			return color;
		}
		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,(\d+[.,]?\d{0,3})/i);

		return rgb  ? <><span className="ColorPicker__hexColorMain">
			{
				"#" +
				("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3],10).toString(16)).slice(-2)
			}
		</span>
			<span className="ColorPicker__hexColorOpacity" >
				{
					rgb[4]*100 + '%'
				}
			</span>
		</>
		 : '';
	   }

	render() {
		const { color } = this.state;
		const { onChange } = this.handlers;
		return (
			<Popover trigger="click" placement="bottom" content={<SketchPicker color={color} onChange={onChange} />}>
				<Button style={{ background: this.getBackgroundColor(color) }}  />
				<span className="ColorPicker__hexColor">{this.rgb2hex(color)}</span>
			</Popover>
		);
	}
}

export default ColorPicker;
