import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, notification, Input, message } from 'antd';
import { v4 } from 'uuid';
import classnames from 'classnames';
import i18n from 'i18next';
import Cookies from 'universal-cookie';
import { fabric } from 'fabric';

import { Flex } from '../flex';
import Icon from '../icon/Icon';
import Scrollbar from '../common/Scrollbar';
import CommonButton from '../common/CommonButton';
import { SVGModal } from '../common';
import logoImage from './../../../public/images/icons/logo_image.png';
import svgLogo from './../../../public/images/icons/svg_logo.svg';
import logologo from './../../../public/images/icons/logo_logo.svg';
import logotext from './../../../public/images/icons/logo_text.svg';
import axios from 'axios';

notification.config({
	top: 80,
	duration: 2,
});

class ImageMapItems extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		descriptors: PropTypes.object,
	};

	state = {
		activeKey: [],
		collapse: false,
		textSearch: '',
		descriptors: {},
		filteredDescriptors: [],
		svgModalVisible: false,
	};

	componentDidMount() {
		const { canvasRef } = this.props;
		this.waitForCanvasRender(canvasRef);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (JSON.stringify(this.props.descriptors) !== JSON.stringify(nextProps.descriptors)) {
			const descriptors = Object.keys(nextProps.descriptors).reduce((prev, key) => {
				return prev.concat(nextProps.descriptors[key]);
			}, []);
			this.setState({
				descriptors,
			});
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (JSON.stringify(this.state.descriptors) !== JSON.stringify(nextState.descriptors)) {
			return true;
		} else if (JSON.stringify(this.state.filteredDescriptors) !== JSON.stringify(nextState.filteredDescriptors)) {
			return true;
		} else if (this.state.textSearch !== nextState.textSearch) {
			return true;
		} else if (JSON.stringify(this.state.activeKey) !== JSON.stringify(nextState.activeKey)) {
			return true;
		} else if (this.state.collapse !== nextState.collapse) {
			return true;
		} else if (this.state.svgModalVisible !== nextState.svgModalVisible) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		const { canvasRef } = this.props;
		this.detachEventListener(canvasRef);
	}

	waitForCanvasRender = canvas => {
		setTimeout(() => {
			if (canvas) {
				this.attachEventListener(canvas);
				return;
			}
			const { canvasRef } = this.props;
			this.waitForCanvasRender(canvasRef);
		}, 5);
	};

	attachEventListener = canvas => {
		canvas.canvas.wrapperEl.addEventListener('dragenter', this.events.onDragEnter, false);
		canvas.canvas.wrapperEl.addEventListener('dragover', this.events.onDragOver, false);
		canvas.canvas.wrapperEl.addEventListener('dragleave', this.events.onDragLeave, false);
		canvas.canvas.wrapperEl.addEventListener('drop', this.events.onDrop, false);
	};

	detachEventListener = canvas => {
		canvas.canvas.wrapperEl.removeEventListener('dragenter', this.events.onDragEnter);
		canvas.canvas.wrapperEl.removeEventListener('dragover', this.events.onDragOver);
		canvas.canvas.wrapperEl.removeEventListener('dragleave', this.events.onDragLeave);
		canvas.canvas.wrapperEl.removeEventListener('drop', this.events.onDrop);
	};

	/* eslint-disable react/sort-comp, react/prop-types */
	handlers = {
		onAddItem: (item, centered) => {
			const { canvasRef } = this.props;
			if (canvasRef.handler.interactionMode === 'polygon') {
				message.info('Already drawing');
				return;
			}
			const id = v4();
			const option = Object.assign({}, item.option, { id });
			if (item.option.superType === 'svg' && item.type === 'default') {
				this.handlers.onSVGModalVisible(item.option);
				return;
			}
			canvasRef.handler.add(option, centered);
		},
		// #work тут onAddSVG
		onAddSVG: (option, centered) => {
			const { canvasRef } = this.props;
			canvasRef.handler.add({ ...option, type: 'svg', superType: 'svg', id: v4(), name: 'New SVG' }, centered);
			this.handlers.onSVGModalVisible();
			console.log('onAddSVG option');
			console.log(option);
		},
		onAddLogo: (option, centered) => {
			const { canvasRef } = this.props;
			const logo = canvasRef.canvas.getObjects().find(el => el.name === 'logo');
			if (logo) canvasRef.handler.removeById(logo.id);
			canvasRef.handler.add(
				{
					type: 'file',
					svg: logologo,
					type: 'svg',
					superType: 'svg',
					id: v4(),
					name: 'logo',
				},
				centered,
			);
			canvasRef.canvas.renderAll();
		},
		onAddLogoUser: (option, centered) => {
			const { canvasRef, onAddItem } = this.props;
			canvasRef.canvas.renderAll();
			const cookies = new Cookies();
			const imgUrl = cookies.get('logourl');
			// https://hayker.heylook.online/wp-content/uploads/2020/09/Logomaster-Heylook-238-1.svg
			let logo = canvasRef.canvas.getObjects().find(el => el.name === 'logo');
			if (!logo) {
				alert('Create logo please');
				return false;
			}
			const logoLeft = logo.left;
			const logoTop = logo.top;
			const logoHeightInitial = logo.height;
			const logoWidthInitial = logo.width;
			const logoScaleXInitial = logo.scaleX;
			const logoScaleYInitial = logo.scaleY;
			const trullyWidth = logoScaleXInitial * logoWidthInitial;
			const trullyHeight = logoHeightInitial * logoScaleYInitial;

			// fabric.loadSVGFromURL('https://hayker.heylook.online/wp-content/uploads/2020/09/Logomaster-Heylook-238-1.svg', function(objects, options, ...other) {
			// 	console.log('ТУТ СМОТРИМ')
			// 	console.log(objects)
			// 	console.log(options)
			// 	console.log(other)

			// });

			// axios.get(`https://hayker.heylook.online/wp-content/uploads/2020/09/Logomaster-Heylook-238-1.svg`).then(res => {
			// 	console.log(res)
			// });

			// fabric.loadSVGFromURL(logotext, function(object) {
			// 	console.log(object);
			// 	let oSVG = object.set({ left: 250, top: 200, angle: 0 });
			// 	oSVG = object.scale(0.25);
			// 	canvas.add(oSVG);
			// 	canvas.renderAll();
			// });

			// loadSvg(svg: string, loadType: 'file' | 'svg') {
			// 	return new Promise<SvgObject>(resolve => {
			// 		if (loadType === 'svg') {
			// 			fabric.loadSVGFromString(svg, (objects, options) => {
			// 				resolve(this.addSvgElements(objects, options, svg));
			// 			});
			// 		} else {
			// 			fabric.loadSVGFromURL(svg, (objects, options) => {
			// 				resolve(this.addSvgElements(objects, options, svg));
			// 			});
			// 		}
			// 	});
			// },

			// canvasRef.handler.removeById(logo.id);

			// canvasRef.handler.add(
			// 	{ type: 'file', svg: logologo, type: 'svg', superType: 'svg', id: v4(), name: 'logo' },
			// 	centered,
			// );
			// .set('top', canvasInitialTop + balanceY * koefY);

			canvasRef.handler.removeById(logo.id);
			onAddItem(imgUrl, true);
			logo = canvasRef.canvas.getObjects().find(el => el.name === 'logo');

			logo.set('left', logoLeft);
			logo.set('top', logoTop);

			const koefX = trullyWidth / logo.height;
			const koefY = trullyHeight / logo.width;

			logo.set('scaleX', logo.scaleX * koefX);
			logo.set('scaleY', logo.scaleY * koefY);

			canvasRef.canvas.renderAll();
		},

		onDrawingItem: item => {
			const { canvasRef } = this.props;
			if (canvasRef.handler.interactionMode === 'polygon') {
				message.info('Already drawing');
				return;
			}
			if (item.option.type === 'line') {
				canvasRef.handler.drawingHandler.line.init();
			} else if (item.option.type === 'arrow') {
				canvasRef.handler.drawingHandler.arrow.init();
			} else {
				canvasRef.handler.drawingHandler.polygon.init();
			}
		},
		onChangeActiveKey: activeKey => {
			this.setState({
				activeKey,
			});
		},
		onCollapse: () => {
			this.setState({
				collapse: !this.state.collapse,
			});
		},
		onSearchNode: e => {
			const filteredDescriptors = this.handlers
				.transformList()
				.filter(descriptor => descriptor.name.toLowerCase().includes(e.target.value.toLowerCase()));
			this.setState({
				textSearch: e.target.value,
				filteredDescriptors,
			});
		},
		transformList: () => {
			return Object.values(this.props.descriptors).reduce((prev, curr) => prev.concat(curr), []);
		},
		onSVGModalVisible: () => {
			this.setState(prevState => {
				return {
					svgModalVisible: !prevState.svgModalVisible,
				};
			});
		},
	};

	events = {
		onDragStart: (e, item) => {
			this.item = item;
			const { target } = e;
			target.classList.add('dragging');
		},
		onDragOver: e => {
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.dataTransfer.dropEffect = 'copy';
			return false;
		},
		onDragEnter: e => {
			const { target } = e;
			target.classList.add('over');
		},
		onDragLeave: e => {
			const { target } = e;
			target.classList.remove('over');
		},
		onDrop: e => {
			e = e || window.event;
			if (e.preventDefault) {
				e.preventDefault();
			}
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			const { layerX, layerY } = e;
			const dt = e.dataTransfer;
			if (dt.types.length && dt.types[0] === 'Files') {
				const { files } = dt;
				Array.from(files).forEach(file => {
					file.uid = v4();
					const { type } = file;
					if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
						const item = {
							option: {
								type: 'image',
								file,
								left: layerX,
								top: layerY,
							},
						};
						this.handlers.onAddItem(item, false);
					} else {
						notification.warn({
							message: 'Not supported file type',
						});
					}
				});
				return false;
			}
			const option = Object.assign({}, this.item.option, { left: layerX, top: layerY });
			const newItem = Object.assign({}, this.item, { option });
			this.handlers.onAddItem(newItem, false);
			return false;
		},
		onDragEnd: e => {
			this.item = null;
			e.target.classList.remove('dragging');
		},
	};

	renderItems = items => (
		<Flex flexWrap="wrap" flexDirection="column" style={{ width: '100%' }}>
			{items.map(item => this.renderItem(item))}
		</Flex>
	);

	renderItem = (item, centered) => {
		console.log('image map itemsitem');

		console.log(item);
		return item.type === 'drawing' ? (
			<div
				key={item.name}
				draggable
				onClick={e => this.handlers.onDrawingItem(item)}
				className="rde-editor-items-item"
				style={{ justifyContent: this.state.collapse ? 'center' : null }}
			>
				<span className="rde-editor-items-item-icon">
					{/* <Icon name={item.icon.name} prefix={item.icon.prefix} style={item.icon.style} /> */}
					{item.name === 'SVG' && <img src={svgLogo} alt="svgLogo" />}
					{item.name === 'Text' && <img src={logotext} alt="logotext" />}
				</span>
				{this.state.collapse ? null : <div className="rde-editor-items-item-text">{item.name}</div>}
			</div>
		) : (
			<div
				key={item.name}
				draggable
				onClick={e =>
					item.type === 'image' ? this.props.makeUnsplash() : this.handlers.onAddItem(item, centered)
				}
				onDragStart={e => this.events.onDragStart(e, item)}
				onDragEnd={e => this.events.onDragEnd(e, item)}
				className="rde-editor-items-item"
				style={{ justifyContent: this.state.collapse ? 'center' : null }}
			>
				<span className="rde-editor-items-item-icon">
					{item.name === 'SVG' && <img src={svgLogo} alt="svgLogo" />}
					{item.name === 'Text' && <img src={logotext} alt="logotext" />}
				</span>
				{this.state.collapse ? null : <div className="rde-editor-items-item-text">{item.name}</div>}
			</div>
		);
	};

	render() {
		const { descriptors, makeUnsplash } = this.props;
		const { collapse, textSearch, filteredDescriptors, activeKey, svgModalVisible, svgOption } = this.state;
		const className = classnames('rde-editor-items', {
			minimize: collapse,
		});
		return (
			<div className={className}>
				<div
					draggable
					onClick={makeUnsplash}
					// onDragStart={e => this.events.onDragStart(e, item)}
					// onDragEnd={e => this.events.onDragEnd(e, item)}
					className="rde-editor-items-item"
					style={{ justifyContent: this.state.collapse ? 'center' : null }}
				>
					<span className="rde-editor-items-item-icon">
						<img src={logoImage} alt="alt_logo" />
					</span>
					{/* {this.state.collapse ? null : <div className="rde-editor-items-item-text">Image</div>} */}
					<div className="rde-editor-items-item-text">Image</div>
				</div>
				<div
					draggable
					onClick={() => this.handlers.onAddLogo()}
					// onDragStart={e => this.events.onDragStart(e, item)}
					// onDragEnd={e => this.events.onDragEnd(e, item)}
					className="rde-editor-items-item"
					style={{ justifyContent: this.state.collapse ? 'center' : null }}
				>
					<span className="rde-editor-items-item-icon">
						<img src={logologo} alt="logologo" />
					</span>
					<div className="rde-editor-items-item-text">Logo</div>
				</div>
				<div
					draggable
					onClick={() => this.handlers.onAddLogoUser()}
					className="rde-editor-items-item"
					style={{ justifyContent: this.state.collapse ? 'center' : null }}
				>
					<span className="rde-editor-items-item-icon">123123123123</span>
					<div className="rde-editor-items-item-text">Logo</div>
				</div>
				<Flex flex="1" flexDirection="column" style={{ height: '100%' }}>
					{/* <Flex justifyContent="center" alignItems="center" style={{ height: 40 }}>
						<CommonButton
							icon={collapse ? 'angle-double-right' : 'angle-double-left'}
							shape="circle"
							className="rde-action-btn"
							style={{ margin: '0 4px' }}
							onClick={this.handlers.onCollapse}
						/>
					</Flex> */}
					<Scrollbar>
						<Flex flex="1" style={{ overflowY: 'hidden' }}>
							{/* {(textSearch.length && this.renderItems(filteredDescriptors)) ||
								(collapse ? (
									<Flex
										flexWrap="wrap"
										flexDirection="column"
										style={{ width: '100%' }}
										justifyContent="center"
									>
										{this.handlers.transformList().map(item => this.renderItem(item))}
									</Flex>
								) : (
									<Collapse
										style={{ width: '100%' }}
										bordered={false}
										activeKey={activeKey.length ? activeKey : Object.keys(descriptors)}
										onChange={this.handlers.onChangeActiveKey}
									>
										{Object.keys(descriptors).map(key => (
											<Collapse.Panel key={key} header={key} showArrow={!collapse}>
												{this.renderItems(descriptors[key])}
											</Collapse.Panel>
										))}
									</Collapse>
								))} */}
							<Flex
								flexWrap="wrap"
								flexDirection="column"
								style={{ width: '100%' }}
								justifyContent="center"
							>
								{this.handlers.transformList().map(item => this.renderItem(item))}
							</Flex>
						</Flex>
					</Scrollbar>
				</Flex>

				<SVGModal
					visible={svgModalVisible}
					onOk={this.handlers.onAddSVG}
					onCancel={this.handlers.onSVGModalVisible}
					option={svgOption}
				/>
			</div>
		);
	}
}

export default ImageMapItems;
