import React, { Component } from 'react';
import { Flex } from '../flex';
import { Tooltip, Switch, Modal, Button } from 'antd';
import axios from 'axios';
import { postThemeInsert, getTheme } from '../../API';
import arrowRight from '../../../public/images/icons/rightArrow.svg';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getAllProducts, getThemes, getThemeProducts, getThemeById, getThemeAndProduct } from '../../API';

const loremLogoTheme =
	'https://is2-ssl.mzstatic.com/image/thumb/Purple113/v4/30/4b/b7/304bb774-1b10-dad1-32e5-1556106b1c28/source/256x256bb.jpg';

class ImageMapTitle extends Component {
	state = { visible: true, sizes: [], part: 'themes', themes: [], chosedThemeId: null, choosedProductTheme: null };

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

	confirm = () => {
		Modal.confirm({
			title: 'Confirm',
			content: 'Are you sure you want to create a new canvas?',
			okText: 'yes',
			cancelText: 'cancel',
			onOk: () => console.log('onOk'),
		});
	};

	chooseMainTheme = id => {
		axios.get(getThemeProducts(id)).then(({ data }) => {
			this.setState({ sizes: data, chosedThemeId: id, part: 'sizes' });
		});
	};

	loadProductTheme = (id_th, id_p) => {
		axios.get(getThemeAndProduct(id_th, id_p)).then(({ data }) => {
			this.setState({ chosedTheme: data[0] });
			console.log('Добавилась тема на канвас');
		});
	};

	renderProducts = products =>
		products.map(({ product_title, product_width, product_height, id_p }) => (
			<li onClick={() => this.loadProductTheme(this.state.chosedThemeId, id_p)}>
				{product_title +`-${id_p}` + ` ${product_width}X${product_height}`}
			</li>
		));

	renderThemes = products =>
		products.map(({ theme_title, id_t }) => (
			<li onClick={() => this.chooseMainTheme(id_t)} key={id_t}>
				<img src={loremLogoTheme} alt="logo of theme" />
				theme:{theme_title + '-' + id_t}
			</li>
		));

	componentWillMount() {
		axios.get(getThemes).then(({ data }) => {
			this.setState({ themes: data });
		});
	}

	render() {
		const { title, content, action, children, canvas, preview, onChangePreview } = this.props;
		const { sizes, part, themes, chosedThemeId } = this.state;

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
						{/* <Flex className="rde-content-layout-title-action" justifyContent="flex-end" alignItems="center">
							{action}
						</Flex> */}
					</Flex.Item>
					<div className=" ">
						<Tooltip title={'preview'}>
							<button onClick={() => onChangePreview(true)} className="btnOverview">
								overview <img src={arrowRight} alt="" />
							</button>
						</Tooltip>
					</div>
					{/* <button className="btnNewSize" onClick={this.showModal}>
						new product
					</button> */}
					<Modal
						title={part === 'themes' ? 'Please select theme' : 'Please select format'}
						visible={this.state.visible}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						okText="CANCEL"
						cancelText="NEXT"
					>
						{part === 'sizes' && <ul className="productsSizes">{this.renderProducts(sizes)}</ul>}
						{part === 'themes' && <ul className="productsThemes">{this.renderThemes(themes)}</ul>}
					</Modal>
				</Flex>
			)
		);
	}
}

export default ImageMapTitle;
