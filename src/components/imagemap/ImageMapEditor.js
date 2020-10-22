import React, { Component } from 'react';
import { Badge, Button, Popconfirm, Menu } from 'antd';
import debounce from 'lodash/debounce';
import i18n from 'i18next';
import axios from 'axios';
import { v4 } from 'uuid';
import { themeInsert, addTheme } from './../../API';
import Cookies from 'universal-cookie';

import ImageMapFooterToolbar from './ImageMapFooterToolbar';
import ImageMapItems from './ImageMapItems';
import ImageMapTitle from './ImageMapTitle';
import ImageMapHeaderToolbar from './ImageMapHeaderToolbar';
import ImageMapPreview from './ImageMapPreview';
import ImageMapConfigurations from './ImageMapConfigurations';
import SandBox from '../sandbox/SandBox';
import UnsplashModal from './UnsplashModal';

import '../../libs/fontawesome-5.2.0/css/all.css';
import '../../styles/index.less';
import Container from '../common/Container';
import CommonButton from '../common/CommonButton';
import Canvas from '../canvas/Canvas';

const style = {
	height: 30,
	border: '1px solid green',
	margin: 6,
	padding: 8,
};

const propertiesToInclude = [
	'id',
	'name',
	'locked',
	'file',
	'src',
	'link',
	'tooltip',
	'animation',
	'layout',
	'workareaWidth',
	'workareaHeight',
	'videoLoadType',
	'autoplay',
	'shadow',
	'muted',
	'loop',
	'code',
	'icon',
	'userProperty',
	'trigger',
	'configuration',
	'superType',
	'points',
	'svg',
	'loadType',
];

const defaultOption = {
	fill: 'rgba(0, 0, 0, 1)',
	stroke: 'rgba(255, 255, 255, 0)',
	strokeUniform: true,
	resource: {},
	link: {
		enabled: false,
		type: 'resource',
		state: 'new',
		dashboard: {},
	},
	tooltip: {
		enabled: true,
		type: 'resource',
		template: '<div>{{message.name}}</div>',
	},
	animation: {
		type: 'none',
		loop: true,
		autoplay: true,
		duration: 1000,
	},
	userProperty: {},
	trigger: {
		enabled: false,
		type: 'alarm',
		script: 'return message.value > 0;',
		effect: 'style',
	},
};

class ImageMapEditor extends Component {
	state = {
		selectedItem: null,
		unsplashActive: false,
		zoomRatio: 1,
		preview: false,
		loading: false,
		progress: 0,
		animations: [],
		styles: [],
		dataSources: [],
		editing: false,
		descriptors: {},
		objects: undefined,
		beginThemeId: false,
	};

	componentDidMount() {
		this.showLoading(true);
		import('./Descriptors.json').then(descriptors => {
			this.setState(
				{
					descriptors,
				},
				() => {
					this.showLoading(false);
				},
			);
		});
		this.setState({
			selectedItem: null,
		});
		this.shortcutHandlers.esc();
	}

	canvasHandlers = {
		// #work onAdd
		onAdd: target => {
			const { editing } = this.state;
			this.forceUpdate();
			if (!editing) {
				this.changeEditing(true);
			}
			if (target.type === 'activeSelection') {
				this.canvasHandlers.onSelect(null);
				return;
			}
			this.canvasRef.handler.select(target);
		},
		onSelect: target => {
			const { selectedItem } = this.state;
			if (target && target.id && target.id !== 'workarea' && target.type !== 'activeSelection') {
				if (selectedItem && target.id === selectedItem.id) {
					return;
				}
				this.canvasRef.handler.getObjects().forEach(obj => {
					if (obj) {
						this.canvasRef.handler.animationHandler.resetAnimation(obj, true);
					}
				});
				this.setState({
					selectedItem: target,
				});
				return;
			}
			this.canvasRef.handler.getObjects().forEach(obj => {
				if (obj) {
					this.canvasRef.handler.animationHandler.resetAnimation(obj, true);
				}
			});
			this.setState({
				selectedItem: null,
			});
		},
		onRemove: () => {
			const { editing } = this.state;
			if (!editing) {
				this.changeEditing(true);
			}
			this.canvasHandlers.onSelect(null);
		},
		onModified: debounce(() => {
			const { editing } = this.state;
			this.forceUpdate();
			if (!editing) {
				this.changeEditing(true);
			}
		}, 300),
		onZoom: zoom => {
			this.setState({
				zoomRatio: zoom,
			});
		},
		// #work onChange
		onChange: (selectedItem, changedValues, allValues) => {
			const { editing } = this.state;
			if (!editing) {
				this.changeEditing(true);
			}
			const changedKey = Object.keys(changedValues)[0];
			const changedValue = changedValues[changedKey];
			if (allValues.workarea) {
				this.canvasHandlers.onChangeWokarea(changedKey, changedValue, allValues.workarea);
				return;
			}
			if (changedKey === 'width' || changedKey === 'height') {
				this.canvasRef.handler.scaleToResize(allValues.width, allValues.height);
				return;
			}
			if (changedKey === 'angle') {
				this.canvasRef.handler.rotate(allValues.angle);
				return;
			}
			if (changedKey === 'locked') {
				this.canvasRef.handler.setObject({
					lockMovementX: changedValue,
					lockMovementY: changedValue,
					hasControls: !changedValue,
					hoverCursor: changedValue ? 'pointer' : 'move',
					editable: !changedValue,
					locked: changedValue,
				});
				return;
			}
			if (changedKey === 'file' || changedKey === 'src' || changedKey === 'code') {
				if (selectedItem.type === 'image') {
					this.canvasRef.handler.setImageById(selectedItem.id, changedValue);
				} else if (selectedItem.superType === 'element') {
					this.canvasRef.handler.elementHandler.setById(selectedItem.id, changedValue);
				}
				return;
			}
			if (changedKey === 'link') {
				const link = Object.assign({}, defaultOption.link, allValues.link);
				this.canvasRef.handler.set(changedKey, link);
				return;
			}
			if (changedKey === 'tooltip') {
				const tooltip = Object.assign({}, defaultOption.tooltip, allValues.tooltip);
				this.canvasRef.handler.set(changedKey, tooltip);
				return;
			}
			if (changedKey === 'animation') {
				const animation = Object.assign({}, defaultOption.animation, allValues.animation);
				this.canvasRef.handler.set(changedKey, animation);
				return;
			}
			if (changedKey === 'icon') {
				const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
				const uni = parseInt(unicode, 16);
				if (styles[0] === 'brands') {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Brands');
				} else if (styles[0] === 'regular') {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Regular');
				} else {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Free');
				}
				this.canvasRef.handler.set('text', String.fromCodePoint(uni));
				this.canvasRef.handler.set('icon', changedValue);
				return;
			}
			if (changedKey === 'shadow') {
				if (allValues.shadow.enabled) {
					if ('blur' in allValues.shadow) {
						this.canvasRef.handler.setShadow(allValues.shadow);
					} else {
						this.canvasRef.handler.setShadow({
							enabled: true,
							blur: 15,
							offsetX: 10,
							offsetY: 10,
						});
					}
				} else {
					this.canvasRef.handler.setShadow(null);
				}
				return;
			}
			if (changedKey === 'fontWeight') {
				this.canvasRef.handler.set(changedKey, changedValue ? 'bold' : 'normal');
				return;
			}
			if (changedKey === 'fontStyle') {
				this.canvasRef.handler.set(changedKey, changedValue ? 'italic' : 'normal');
				return;
			}
			if (changedKey === 'textAlign') {
				this.canvasRef.handler.set(changedKey, Object.keys(changedValue)[0]);
				return;
			}
			if (changedKey === 'trigger') {
				const trigger = Object.assign({}, defaultOption.trigger, allValues.trigger);
				this.canvasRef.handler.set(changedKey, trigger);
				return;
			}
			if (changedKey === 'filters') {
				const filterKey = Object.keys(changedValue)[0];
				const filterValue = allValues.filters[filterKey];
				if (filterKey === 'gamma') {
					const rgb = [filterValue.r, filterValue.g, filterValue.b];
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						gamma: rgb,
					});
					return;
				}
				if (filterKey === 'brightness') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						brightness: filterValue.brightness,
					});
					return;
				}
				if (filterKey === 'contrast') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						contrast: filterValue.contrast,
					});
					return;
				}
				if (filterKey === 'saturation') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						saturation: filterValue.saturation,
					});
					return;
				}
				if (filterKey === 'hue') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						rotation: filterValue.rotation,
					});
					return;
				}
				if (filterKey === 'noise') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						noise: filterValue.noise,
					});
					return;
				}
				if (filterKey === 'pixelate') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						blocksize: filterValue.blocksize,
					});
					return;
				}
				if (filterKey === 'blur') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						value: filterValue.value,
					});
					return;
				}
				this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey]);
				return;
			}
			if (changedKey === 'chartOption') {
				try {
					const sandbox = new SandBox();
					const compiled = sandbox.compile(changedValue);
					const { animations, styles } = this.state;
					const chartOption = compiled(3, animations, styles, selectedItem.userProperty);
					selectedItem.setChartOptionStr(changedValue);
					this.canvasRef.handler.elementHandler.setById(selectedItem.id, chartOption);
				} catch (error) {
					console.error(error);
				}
				return;
			}
			this.canvasRef.handler.set(changedKey, changedValue);
		},
		onChangeWokarea: (changedKey, changedValue, allValues) => {
			if (changedKey === 'layout') {
				this.canvasRef.handler.workareaHandler.setLayout(changedValue);
				return;
			}
			if (changedKey === 'file' || changedKey === 'src') {
				this.canvasRef.handler.workareaHandler.setImage(changedValue);
				return;
			}
			if (changedKey === 'width' || changedKey === 'height') {
				this.canvasRef.handler.originScaleToResize(
					this.canvasRef.handler.workarea,
					allValues.width,
					allValues.height,
				);
				this.canvasRef.canvas.centerObject(this.canvasRef.handler.workarea);
				return;
			}
			this.canvasRef.handler.workarea.set(changedKey, changedValue);
			this.canvasRef.canvas.requestRenderAll();
		},
		onTooltip: (ref, target) => {
			const value = Math.random() * 10 + 1;
			const { animations, styles } = this.state;
			// const { code } = target.trigger;
			// const compile = SandBox.compile(code);
			// const result = compile(value, animations, styles, target.userProperty);
			// console.log(result);
			return (
				<div>
					<div>
						<div>
							<Button>{target.id}</Button>
						</div>
						<Badge count={value} />
					</div>
				</div>
			);
		},
		onClick: (canvas, target) => {
			const { link } = target;
			if (link.state === 'current') {
				document.location.href = link.url;
				return;
			}
			window.open(link.url);
		},
		onContext: (ref, event, target) => {
			if ((target && target.id === 'workarea') || !target) {
				const { layerX: left, layerY: top } = event;
				return (
					<Menu>
						<Menu.SubMenu key="add" style={{ width: 120 }} title={i18n.t('action.add')}>
							{this.transformList().map(item => {
								const option = Object.assign({}, item.option, { left, top });
								const newItem = Object.assign({}, item, { option });
								return (
									<Menu.Item style={{ padding: 0 }} key={item.name}>
										{this.itemsRef.renderItem(newItem, false)}
									</Menu.Item>
								);
							})}
						</Menu.SubMenu>
					</Menu>
				);
			}
			if (target.type === 'activeSelection') {
				return (
					<Menu>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.toGroup();
							}}
						>
							{i18n.t('action.object-group')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.duplicate();
							}}
						>
							{i18n.t('action.clone')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.remove();
							}}
						>
							{i18n.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			if (target.type === 'group') {
				return (
					<Menu>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.toActiveSelection();
							}}
						>
							{i18n.t('action.object-ungroup')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.duplicate();
							}}
						>
							{i18n.t('action.clone')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.remove();
							}}
						>
							{i18n.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			return (
				<Menu>
					<Menu.Item
						onClick={() => {
							this.canvasRef.handler.duplicateById(target.id);
						}}
					>
						{i18n.t('action.clone')}
					</Menu.Item>
					<Menu.Item
						onClick={() => {
							this.canvasRef.handler.removeById(target.id);
						}}
					>
						{i18n.t('action.delete')}
					</Menu.Item>
				</Menu>
			);
		},
		onTransaction: transaction => {
			this.forceUpdate();
		},
	};

	handlers = {
		onChangePreview: checked => {
			let data;
			if (this.canvasRef) {
				data = this.canvasRef.handler.exportJSON().filter(obj => {
					if (!obj.id) {
						return false;
					}
					return true;
				});
			}
			this.setState({
				preview: typeof checked === 'object' ? false : checked,
				objects: data,
			});
		},
		onProgress: progress => {
			this.setState({
				progress,
			});
		},
		onImport: files => {
			if (files) {
				this.showLoading(true);
				setTimeout(() => {
					const reader = new FileReader();
					reader.onprogress = e => {
						if (e.lengthComputable) {
							const progress = parseInt((e.loaded / e.total) * 100, 10);
							this.handlers.onProgress(progress);
						}
					};
					reader.onload = e => {
						const { objects, animations, styles, dataSources } = JSON.parse(e.target.result);
						this.setState({
							animations,
							styles,
							dataSources,
						});
						if (objects) {
							this.canvasRef.handler.clear(true);
							const data = objects.filter(obj => {
								if (!obj.id) {
									return false;
								}
								return true;
							});
							console.log('import data ______');
							console.log(data);
							this.canvasRef.handler.importJSON(data);
						}
					};
					reader.onloadend = () => {
						this.showLoading(false);
					};
					reader.onerror = () => {
						this.showLoading(false);
					};
					reader.readAsText(files[0]);
				}, 500);
			}
		},
		onUpload: () => {
			const inputEl = document.createElement('input');
			inputEl.accept = '.json';
			inputEl.type = 'file';
			inputEl.hidden = true;
			inputEl.onchange = e => {
				console.log(e.target.files);
				this.handlers.onImport(e.target.files);
			};
			document.body.appendChild(inputEl); // required for firefox
			inputEl.click();
			inputEl.remove();
		},
		onDownload: () => {
			// this.showLoading(true);
			const cookies = new Cookies();
			const userId = cookies.get('user_id');
			const objects = this.canvasRef.handler.exportJSON().filter(obj => {
				if (!obj.id) {
					return false;
				}
				return true;
			});
			const { animations, styles, dataSources, beginThemeId } = this.state;
			const exportDatas = {
				objects,
				animations,
				styles,
				dataSources,
			};
			// themeInsert
			// addTheme
			const jsonShedule = JSON.stringify(exportDatas, null, '\t');
			if (!this.canvasRef.idProd) {
				axios
					.post(themeInsert, {
						user_id: +userId,
						theme_title: this.canvasRef.state.id,
						theme_data: jsonShedule,
						product_id: 1,
					})
					.then(response => {
						console.log(response.data);
						this.setState({ beginThemeId: response.data.id });
						// this.showLoading(false);
					})
					.catch(function(error) {
						console.log(error);
						// this.showLoading(false);
					});
			} else {
				axios
					.post(addTheme, {
						theme_id: beginThemeId,
						theme_data: jsonShedule,
						product_id: this.canvasRef.idProd,
					})
					.then(function(response) {
						console.log(response);
						// this.showLoading(false);
					})
					.catch(function(error) {
						console.log(error);
						// this.showLoading(false);
					});
			}
			// const anchorEl = document.createElement('a');
			// anchorEl.href = `data:text/json;charset=utf-8,${encodeURIComponent(
			// 	JSON.stringify(exportDatas, null, '\t'),
			// )}`;
			// anchorEl.download = `${this.canvasRef.handler.workarea.name || 'sample'}.json`;
			// document.body.appendChild(anchorEl); // required for firefox
			// anchorEl.click();
			// anchorEl.remove();
		},
		onChangeAnimations: animations => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				animations,
			});
		},
		onChangeStyles: styles => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				styles,
			});
		},
		onChangeDataSources: dataSources => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				dataSources,
			});
		},
		onSaveImage: () => {
			this.canvasRef.handler.saveCanvasImage();
		},
		onAddItem: (src, logo) => {
			const canvasRef = this.canvasRef;
			const id = v4();
			const option = Object.assign(
				{},
				{
					type: 'image',
					name: logo ? 'logo' : 'New image',
					src,
					id,
				},
			);
			canvasRef.handler.add(option, true);
		},
		onRechangeImage: src => {
			const { selectedItem } = this.state;
			const canvasRef = this.canvasRef;

			let correctScaleX = 2;
			let correctScaleY = 2;

			const initialWidth = selectedItem.width;
			const initialHeight = selectedItem.height;
			const initialScaleX = selectedItem.scaleX;
			const initialScaleY = selectedItem.scaleY;
			const trullyinitialWidth = initialScaleX * initialWidth;
			const trullyinitialHeight = initialScaleY * initialHeight;
			console.log('old image');
			console.log(initialWidth);
			console.log(initialHeight);
			console.log(initialScaleX);
			console.log(initialScaleY);

			selectedItem.setSrc(src, newImg => {
				console.log('newImg');
				console.log(newImg.width);
				console.log(newImg.height);
				console.log(newImg.scaleX);
				console.log(newImg.scaleY);

				const koefX = (trullyinitialWidth / newImg.width).toFixed(25);
				const koefy = (trullyinitialHeight / newImg.height).toFixed(25);

				newImg.set('scaleX', koefX);
				newImg.set('scaleY', koefy);

				canvasRef.canvas.renderAll();
			});
		},
	};

	shortcutHandlers = {
		esc: () => {
			document.addEventListener('keydown', e => {
				if (e.keyCode === 27) {
					this.handlers.onChangePreview(false);
				}
			});
		},
	};

	transformList = () => {
		return Object.values(this.state.descriptors).reduce((prev, curr) => prev.concat(curr), []);
	};

	showLoading = loading => {
		this.setState({
			loading,
		});
	};

	changeEditing = editing => {
		this.setState({
			editing,
		});
	};

	render() {
		const {
			preview,
			selectedItem,
			zoomRatio,
			loading,
			progress,
			animations,
			styles,
			dataSources,
			editing,
			descriptors,
			objects,
			unsplashActive,
		} = this.state;
		const {
			onAdd,
			onRemove,
			onSelect,
			onModified,
			onChange,
			onZoom,
			onTooltip,
			onClick,
			onContext,
			onTransaction,
		} = this.canvasHandlers;
		const {
			onChangePreview,
			onDownload,
			onUpload,
			onChangeAnimations,
			onChangeStyles,
			onChangeDataSources,
			onSaveImage,
			onAddItem,
			onRechangeImage,
		} = this.handlers;

		const action = (
			<React.Fragment>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="file-download"
					disabled={!editing}
					tooltipTitle={i18n.t('action.download')}
					onClick={onDownload}
					tooltipPlacement="bottomRight"
				/>
				{editing ? (
					<Popconfirm
						title={i18n.t('imagemap.imagemap-editing-confirm')}
						okText={i18n.t('action.ok')}
						cancelText={i18n.t('action.cancel')}
						onConfirm={onUpload}
						placement="bottomRight"
					>
						<CommonButton
							className="rde-action-btn"
							shape="circle"
							icon="file-upload"
							tooltipTitle={i18n.t('action.upload')}
							tooltipPlacement="bottomRight"
						/>
					</Popconfirm>
				) : (
					<CommonButton
						className="rde-action-btn"
						shape="circle"
						icon="file-upload"
						tooltipTitle={i18n.t('action.upload')}
						tooltipPlacement="bottomRight"
						onClick={onUpload}
					/>
				)}
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="image"
					tooltipTitle={i18n.t('action.image-save')}
					onClick={onSaveImage}
					tooltipPlacement="bottomRight"
				/>
			</React.Fragment>
		);
		const titleContent = (
			<React.Fragment>
				<span>{i18n.t('imagemap.imagemap-editor')}</span>
			</React.Fragment>
		);
		const title = (
			<ImageMapTitle
				title={titleContent}
				action={action}
				canvas={this.canvasRef}
				preview={preview}
				onChangePreview={onChangePreview}
				zoomRatio={zoomRatio}
				onDownload={this.handlers.onDownload}
			/>
		);
		const content = (
			<div className="rde-editor-wrapper">
				{/* <div className="rde-editor-topPanel">
					<span>FileName: Configurable file</span>
				</div> */}
				<div className="rde-editor">
					<ImageMapItems
						ref={c => {
							this.itemsRef = c;
						}}
						canvasRef={this.canvasRef}
						descriptors={descriptors}
						onAddItem={onAddItem}
						selectedItem={selectedItem}
						makeUnsplash={() => {
							this.setState({ unsplashActive: !this.state.unsplashActive });
						}}
					/>
					{unsplashActive && (
						<UnsplashModal
							selectedItem={selectedItem}
							onAddItem={onRechangeImage}
							close={() => this.setState({ unsplashActive: false })}
						/>
					)}
					<div className="rde-editor-canvas-container">
						<div className="rde-editor-header-toolbar">
							<ImageMapHeaderToolbar
								canvasRef={this.canvasRef}
								selectedItem={selectedItem}
								onSelect={onSelect}
							/>
						</div>
						<div
							ref={c => {
								this.container = c;
							}}
							className="rde-editor-canvas"
						>
							<Canvas
								ref={c => {
									this.canvasRef = c;
								}}
								className="rde-canvas"
								minZoom={30}
								maxZoom={500}
								objectOption={defaultOption}
								propertiesToInclude={propertiesToInclude}
								onModified={onModified}
								onAdd={onAdd}
								onRemove={onRemove}
								onSelect={onSelect}
								onZoom={onZoom}
								onTooltip={onTooltip}
								onClick={onClick}
								onContext={onContext}
								onTransaction={onTransaction}
								keyEvent={{
									transaction: true,
								}}
							/>
						</div>
						<div className="rde-editor-footer-toolbar">
							<ImageMapFooterToolbar
								canvasRef={this.canvasRef}
								preview={preview}
								onChangePreview={onChangePreview}
								zoomRatio={zoomRatio}
							/>
						</div>
					</div>
					<ImageMapConfigurations
						canvasRef={this.canvasRef}
						onChange={onChange}
						selectedItem={selectedItem}
						onChangeAnimations={onChangeAnimations}
						onChangeStyles={onChangeStyles}
						onChangeDataSources={onChangeDataSources}
						animations={animations}
						styles={styles}
						dataSources={dataSources}
					/>
					<ImageMapPreview
						preview={preview}
						onChangePreview={onChangePreview}
						onTooltip={onTooltip}
						onClick={onClick}
						objects={objects}
					/>
				</div>
			</div>
		);

		return <Container title={title} content={content} loading={loading} className="" />;
	}
}

export default ImageMapEditor;

// {	"objects": [		{			"type": "image",			"version": "3.6.6",			"originX": "left",			"originY": "top",			"left": -164,			"top": -311,			"width": 180,			"height": 180,			"fill": "rgb(0,0,0)",			"stroke": null,			"strokeWidth": 0,			"strokeDashArray": null,			"strokeLineCap": "butt",			"strokeDashOffset": 0,			"strokeLineJoin": "miter",			"strokeMiterLimit": 4,			"scaleX": 1,			"scaleY": 1,			"angle": 0,			"flipX": false,			"flipY": false,			"opacity": 1,			"shadow": null,			"visible": true,			"clipTo": null,			"backgroundColor": "#fff",			"fillRule": "nonzero",			"paintFirst": "fill",			"globalCompositeOperation": "source-over",			"transformMatrix": null,			"skewX": 0,			"skewY": 0,			"crossOrigin": "",			"cropX": 0,			"cropY": 0,			"id": "workarea",			"name": "",			"link": {},			"tooltip": {				"enabled": false			},			"layout": "fixed",			"workareaWidth": 1920,			"workareaHeight": 1040,			"src": "",			"filters": []		},		{			"type": "image",			"version": "3.6.6",			"originX": "left",			"originY": "top",			"left": -97.52,			"top": -231.57,			"width": 200,			"height": 133,			"fill": "rgba(0, 0, 0, 1)",			"stroke": "rgba(255, 255, 255, 0)",			"strokeWidth": 0,			"strokeDashArray": null,			"strokeLineCap": "butt",			"strokeDashOffset": 0,			"strokeLineJoin": "miter",			"strokeMiterLimit": 4,			"scaleX": 0.09,			"scaleY": 0.17,			"angle": 0,			"flipX": false,			"flipY": false,			"opacity": 1,			"shadow": null,			"visible": true,			"clipTo": null,			"backgroundColor": "",			"fillRule": "nonzero",			"paintFirst": "fill",			"globalCompositeOperation": "source-over",			"transformMatrix": null,			"skewX": 0,			"skewY": 0,			"crossOrigin": "",			"cropX": 0,			"cropY": 0,			"id": "86eb7174-89d5-4c12-a758-8a79f8b3dcb0",			"name": "New image",			"file": null,			"src": "https://images.unsplash.com/photo-1600950603226-e9443673e604?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3MDQyNH0",			"link": {				"enabled": false,				"type": "resource",				"state": "new",				"dashboard": {}			},			"tooltip": {				"enabled": true,				"type": "resource",				"template": "<div>{{message.name}}</div>"			},			"animation": {				"type": "none",				"loop": true,				"autoplay": true,				"duration": 1000			},			"userProperty": {},			"trigger": {				"enabled": false,				"type": "alarm",				"script": "return message.value > 0;",				"effect": "style"			},			"editable": true,			"filters": []		}	],	"animations": [],	"styles": [],	"dataSources": []}

// '{
// 	"objects": [
// 		{
// 			"type": "image",
// 			"version": "3.6.6",
// 			"originX": "left",
// 			"originY": "top",
// 			"left": -164,
// 			"top": -311,
// 			"width": 180,
// 			"height": 180,
// 			"fill": "rgb(0,0,0)",
// 			"stroke": null,
// 			"strokeWidth": 0,
// 			"strokeDashArray": null,
// 			"strokeLineCap": "butt",
// 			"strokeDashOffset": 0,
// 			"strokeLineJoin": "miter",
// 			"strokeMiterLimit": 4,
// 			"scaleX": 1,
// 			"scaleY": 1,
// 			"angle": 0,
// 			"flipX": false,
// 			"flipY": false,
// 			"opacity": 1,
// 			"shadow": null,
// 			"visible": true,
// 			"clipTo": null,
// 			"backgroundColor": "#fff",
// 			"fillRule": "nonzero",
// 			"paintFirst": "fill",
// 			"globalCompositeOperation": "source-over",
// 			"transformMatrix": null,
// 			"skewX": 0,
// 			"skewY": 0,
// 			"crossOrigin": "",
// 			"cropX": 0,
// 			"cropY": 0,
// 			"id": "workarea",
// 			"name": "",
// 			"link": {},
// 			"tooltip": {
// 				"enabled": false
// 			},
// 			"layout": "fixed",
// 			"workareaWidth": 1920,
// 			"workareaHeight": 1040,
// 			"src": "",
// 			"filters": []
// 		},
// 		{
// 			"type": "image",
// 			"version": "3.6.6",
// 			"originX": "left",
// 			"originY": "top",
// 			"left": -97.52,
// 			"top": -231.57,
// 			"width": 200,
// 			"height": 133,
// 			"fill": "rgba(0, 0, 0, 1)",
// 			"stroke": "rgba(255, 255, 255, 0)",
// 			"strokeWidth": 0,
// 			"strokeDashArray": null,
// 			"strokeLineCap": "butt",
// 			"strokeDashOffset": 0,
// 			"strokeLineJoin": "miter",
// 			"strokeMiterLimit": 4,
// 			"scaleX": 0.09,
// 			"scaleY": 0.17,
// 			"angle": 0,
// 			"flipX": false,
// 			"flipY": false,
// 			"opacity": 1,
// 			"shadow": null,
// 			"visible": true,
// 			"clipTo": null,
// 			"backgroundColor": "",
// 			"fillRule": "nonzero",
// 			"paintFirst": "fill",
// 			"globalCompositeOperation": "source-over",
// 			"transformMatrix": null,
// 			"skewX": 0,
// 			"skewY": 0,
// 			"crossOrigin": "",
// 			"cropX": 0,
// 			"cropY": 0,
// 			"id": "86eb7174-89d5-4c12-a758-8a79f8b3dcb0",
// 			"name": "New image",
// 			"file": null,
// 			"src": "https://images.unsplash.com/photo-1600950603226-e9443673e604?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3MDQyNH0",
// 			"link": {
// 				"enabled": false,
// 				"type": "resource",
// 				"state": "new",
// 				"dashboard": {}
// 			},
// 			"tooltip": {
// 				"enabled": true,
// 				"type": "resource",
// 				"template": "<div>{{message.name}}</div>"
// 			},
// 			"animation": {
// 				"type": "none",
// 				"loop": true,
// 				"autoplay": true,
// 				"duration": 1000
// 			},
// 			"userProperty": {},
// 			"trigger": {
// 				"enabled": false,
// 				"type": "alarm",
// 				"script": "return message.value > 0;",
// 				"effect": "style"
// 			},
// 			"editable": true,
// 			"filters": []
// 		}
// 	],
// 	"animations": [],
// 	"styles": [],
// 	"dataSources": []
// }'

// "'{\n\t\"objects\": [\n\t\t{\n\t\t\t\"type\": \"image\",\n\t\t\t\"version\": \"3.6.6\",\n\t\t\t\"originX\": \"left\",\n\t\t\t\"originY\": \"top\",\n\t\t\t\"left\": -164,\n\t\t\t\"top\": -311,\n\t\t\t\"width\": 180,\n\t\t\t\"height\": 180,\n\t\t\t\"fill\": \"rgb(0,0,0)\",\n\t\t\t\"stroke\": null,\n\t\t\t\"strokeWidth\": 0,\n\t\t\t\"strokeDashArray\": null,\n\t\t\t\"strokeLineCap\": \"butt\",\n\t\t\t\"strokeDashOffset\": 0,\n\t\t\t\"strokeLineJoin\": \"miter\",\n\t\t\t\"strokeMiterLimit\": 4,\n\t\t\t\"scaleX\": 1,\n\t\t\t\"scaleY\": 1,\n\t\t\t\"angle\": 0,\n\t\t\t\"flipX\": false,\n\t\t\t\"flipY\": false,\n\t\t\t\"opacity\": 1,\n\t\t\t\"shadow\": null,\n\t\t\t\"visible\": true,\n\t\t\t\"clipTo\": null,\n\t\t\t\"backgroundColor\": \"#fff\",\n\t\t\t\"fillRule\": \"nonzero\",\n\t\t\t\"paintFirst\": \"fill\",\n\t\t\t\"globalCompositeOperation\": \"source-over\",\n\t\t\t\"transformMatrix\": null,\n\t\t\t\"skewX\": 0,\n\t\t\t\"skewY\": 0,\n\t\t\t\"crossOrigin\": \"\",\n\t\t\t\"cropX\": 0,\n\t\t\t\"cropY\": 0,\n\t\t\t\"id\": \"workarea\",\n\t\t\t\"name\": \"\",\n\t\t\t\"link\": {},\n\t\t\t\"tooltip\": {\n\t\t\t\t\"enabled\": false\n\t\t\t},\n\t\t\t\"layout\": \"fixed\",\n\t\t\t\"workareaWidth\": 1920,\n\t\t\t\"workareaHeight\": 1040,\n\t\t\t\"src\": \"\",\n\t\t\t\"filters\": []\n\t\t},\n\t\t{\n\t\t\t\"type\": \"image\",\n\t\t\t\"version\": \"3.6.6\",\n\t\t\t\"originX\": \"left\",\n\t\t\t\"originY\": \"top\",\n\t\t\t\"left\": -97.52,\n\t\t\t\"top\": -231.57,\n\t\t\t\"width\": 200,\n\t\t\t\"height\": 133,\n\t\t\t\"fill\": \"rgba(0, 0, 0, 1)\",\n\t\t\t\"stroke\": \"rgba(255, 255, 255, 0)\",\n\t\t\t\"strokeWidth\": 0,\n\t\t\t\"strokeDashArray\": null,\n\t\t\t\"strokeLineCap\": \"butt\",\n\t\t\t\"strokeDashOffset\": 0,\n\t\t\t\"strokeLineJoin\": \"miter\",\n\t\t\t\"strokeMiterLimit\": 4,\n\t\t\t\"scaleX\": 0.09,\n\t\t\t\"scaleY\": 0.17,\n\t\t\t\"angle\": 0,\n\t\t\t\"flipX\": false,\n\t\t\t\"flipY\": false,\n\t\t\t\"opacity\": 1,\n\t\t\t\"shadow\": null,\n\t\t\t\"visible\": true,\n\t\t\t\"clipTo\": null,\n\t\t\t\"backgroundColor\": \"\",\n\t\t\t\"fillRule\": \"nonzero\",\n\t\t\t\"paintFirst\": \"fill\",\n\t\t\t\"globalCompositeOperation\": \"source-over\",\n\t\t\t\"transformMatrix\": null,\n\t\t\t\"skewX\": 0,\n\t\t\t\"skewY\": 0,\n\t\t\t\"crossOrigin\": \"\",\n\t\t\t\"cropX\": 0,\n\t\t\t\"cropY\": 0,\n\t\t\t\"id\": \"86eb7174-89d5-4c12-a758-8a79f8b3dcb0\",\n\t\t\t\"name\": \"New image\",\n\t\t\t\"file\": null,\n\t\t\t\"src\": \"https://images.unsplash.com/photo-1600950603226-e9443673e604?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3MDQyNH0\",\n\t\t\t\"link\": {\n\t\t\t\t\"enabled\": false,\n\t\t\t\t\"type\": \"resource\",\n\t\t\t\t\"state\": \"new\",\n\t\t\t\t\"dashboard\": {}\n\t\t\t},\n\t\t\t\"tooltip\": {\n\t\t\t\t\"enabled\": true,\n\t\t\t\t\"type\": \"resource\",\n\t\t\t\t\"template\": \"<div>{{message.name}}</div>\"\n\t\t\t},\n\t\t\t\"animation\": {\n\t\t\t\t\"type\": \"none\",\n\t\t\t\t\"loop\": true,\n\t\t\t\t\"autoplay\": true,\n\t\t\t\t\"duration\": 1000\n\t\t\t},\n\t\t\t\"userProperty\": {},\n\t\t\t\"trigger\": {\n\t\t\t\t\"enabled\": false,\n\t\t\t\t\"type\": \"alarm\",\n\t\t\t\t\"script\": \"return message.value > 0;\",\n\t\t\t\t\"effect\": \"style\"\n\t\t\t},\n\t\t\t\"editable\": true,\n\t\t\t\"filters\": []\n\t\t}\n\t],\n\t\"animations\": [],\n\t\"styles\": [],\n\t\"dataSources\": []\n}'"
