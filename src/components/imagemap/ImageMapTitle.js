import React, { Component } from 'react';
import { Flex } from '../flex';
import { Tooltip, Switch, Modal, Button } from 'antd';
import axios from 'axios';
import { postThemeInsert } from '../../API';
import arrowRight from '../../../public/images/icons/rightArrow.svg';

//mocks
const mock_prod = [
	{
		name: 'Twitter Post (1012x506)',
		sizes: {
			width: 1012,
			height: 506,
		},
	},
	{
		name: 'Twitter Header (1500x500)',
		sizes: {
			width: 1500,
			height: 500,
		},
	},
	{
		name: 'Facebook Post (1200x630)',
		sizes: {
			width: 1200,
			height: 630,
		},
	},
	{
		name: 'Facebook Cover (830x312)',
		sizes: {
			width: 830,
			height: 312,
		},
	},
	{
		name: 'Instagram Post (1080x1080)',
		sizes: {
			width: 1080,
			height: 1080,
		},
	},
	{
		name: 'Instagram Story (1080x1920)',
		sizes: {
			width: 1080,
			height: 1920,
		},
	},
	{
		name: 'Dribbble Shot (400x300)',
		sizes: {
			width: 400,
			height: 300,
		},
	},
	{
		name: 'Dribbble Shot HD (800x600)',
		sizes: {
			width: 800,
			height: 600,
		},
	},
];

class ImageMapTitle extends Component {
	state = { visible: false };

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleOk = e => {
		console.log(e);
		this.setState({
			visible: false,
		});
	};

	handleCancel = e => {
		console.log(e);
		this.setState({
			visible: false,
		});
	};

	changeSizeOfCanvas = (width, height) => {
		const { canvas } = this.props;
		const newX = width;
		const newY = height;

		var objs = canvas.canvas.getObjects().map(function(o) {
			return o.set('active', true);
		});
		objs = objs.slice(1);

		//deactivate some items i dont want to resize (this works)

		// canvas.canvas.item(1).set('active', true);
		// canvas.canvas.item(2).set('active', true);
		// canvas.item(3).set('active', false);
		// canvas.item(4).set('active', false);

		const oldX = canvas.canvas.item(0).width;
		const oldY = canvas.canvas.item(0).height;
		const canvasInitialLeft = canvas.canvas.item(0).left;
		const canvasInitialTop = canvas.canvas.item(0).top;

		//Найти коэфициент старый к новому

		const koefX = newX / oldX;
		const koefY = newY / oldY;

		canvas.canvas.item(0).set('height', newY);
		canvas.canvas.item(0).set('width', newX);

		canvas.handler.selectAll();

		const selectGroupLeft = canvas.canvas._activeObject.left;
		const selectGroupTop = canvas.canvas._activeObject.top;

		const balanceX = selectGroupLeft - canvasInitialLeft;
		const balanceY = selectGroupTop - canvasInitialTop;

		canvas.canvas._activeObject.set('scaleX', canvas.canvas._activeObject.scaleX * koefX);
		canvas.canvas._activeObject.set('scaleY', canvas.canvas._activeObject.scaleY * koefY);

		canvas.canvas._activeObject.set('left', canvasInitialLeft + balanceX * koefX);
		canvas.canvas._activeObject.set('top', canvasInitialTop + balanceY * koefY);

		canvas.canvas.renderAll();
	};

	makeNewCanvas = () => {
		const { canvas } = this.props;
		canvas.handler.clear();
		canvas.canvas.item(0).set('width', 1920);
		canvas.canvas.item(0).set('height', 1080);
		canvas.canvas.renderAll();
	};

	confirm = () => {
		Modal.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to create a new canvas?',
			okText: 'yes',
			cancelText: 'cancel',
			onOk: this.makeNewCanvas,
		});
	};

	saveTheme = () => {
		axios
			.post(postThemeInsert, {
				user_id:'user_id_test',
				theme_name:'theme_name_test',
				theme_data:'theme_data_test'
			})
			.then(function(response) {
				console.log(response);
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	renderProducts = products =>
		products.map(({ name, sizes }) => (
			<li onClick={() => this.changeSizeOfCanvas(sizes.width, sizes.height)}>{name}</li>
		));

	render() {
		const { title, content, action, children, canvas, preview, onChangePreview } = this.props;
		return (
			children || (
				<Flex className="rde-content-layout-title" alignItems="center" flexWrap="wrap" justifyContent="center">
					<Flex.Item flex="0 1 auto">
						<Flex
							className="rde-content-layout-title-title"
							justifyContent="flex-start"
							alignItems="center"
						>
							{title instanceof String ? <h3>{title}</h3> : title}
							<button className="btnNewSize" style={{ 'margin-left': '20px' }} onClick={this.confirm}>
								new canvas +
							</button>
						</Flex>
					</Flex.Item>
					{/* <Flex.Item flex="auto">
						<Flex className="rde-content-layout-title-content" alignItems="center">
							{content}
						</Flex>
					</Flex.Item> */}
					{/* #need for future work */}
					{/* #Work здесь кнопки загрузки/сохранения картинки */}
					<Flex.Item flex="auto">
						<Flex className="rde-content-layout-title-action" justifyContent="flex-end" alignItems="center">
							{action}
						</Flex>
					</Flex.Item>
					<div className=" ">
						<Tooltip title={'preview'}>
							<button onClick={() => onChangePreview(true)} className="btnOverview">
								overview <img src={arrowRight} alt="" />
							</button>
						</Tooltip>
					</div>
					<button className="btnNewSize" onClick={this.showModal}>
						new product
					</button>
					<button onClick={this.saveTheme}>Test</button>
					<Modal
						title="Please select format"
						visible={this.state.visible}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						okText="CANCEL"
						cancelText="NEXT"
					>
						<ul className="productsSizes">{this.renderProducts(mock_prod)}</ul>
					</Modal>
				</Flex>
			)
		);
	}
}

export default ImageMapTitle;
