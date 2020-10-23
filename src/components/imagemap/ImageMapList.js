import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';

import Icon from '../icon/Icon';
import { Flex } from '../flex';
import i18next from 'i18next';
import cloneImg from '../../../public/images/icons/clone.svg';
import trash from '../../../public/images/icons/Subtract.svg';
import logoImage from '../../../public/images/icons/logo_image.png';
import svgLogo from '../../../public/images/icons/svg_logo.svg';
import logologo from '../../../public/images/icons/logo_logo.svg';
import logotext from '../../../public/images/icons/logo_text.svg';
import layersImg from '../../../public/images/icons/GroupLayers.png';
import PropertyCompanyColor from './properties/PropertyCompanyColor';

class ImageMapList extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		selectedItem: PropTypes.object,
	};

	renderActions = () => {
		const { canvasRef } = this.props;
		const idCropping = canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;
		return (
			<Flex.Item className="rde-canvas-list-actions">
				<div className="rde-canvas-list-title">
					<img src={layersImg} alt="layers" />
					<h5 className="" style={{ 'font-size': '18px' }}>
						Layers
					</h5>
				</div>
				{/* <Flex justifyContent="space-between" alignItems="center">
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={idCropping}
							onClick={e => canvasRef.handler.sendBackwards()}
						>
							<Icon name="arrow-up" />
						</Button>
					</Flex>
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={idCropping}
							onClick={e => canvasRef.handler.bringForward()}
						>
							<Icon name="arrow-down" />
						</Button>
					</Flex>
				</Flex> */}
			</Flex.Item>
		);
	};

	renderItem = () => {
		const { canvasRef, selectedItem } = this.props;
		const idCropping = canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;

		return canvasRef
			? canvasRef.canvas
					.getObjects()
					.filter(obj => {
						if (obj.id === 'workarea') {
							return false;
						}
						if (obj.id) {
							return true;
						}
						return false;
					})
					.map(obj => {
						let icon;
						let title = obj.name || obj.type;
						let prefix = 'fas';
						if (obj.type === 'i-text') {
							icon = 'map-marker-alt';
						} else if (obj.type === 'textbox') {
							icon = 'font';
						} else if (obj.type === 'image') {
							icon = 'image';
						} else if (obj.type === 'triangle') {
							icon = 'image';
						} else if (obj.type === 'rect') {
							icon = 'image';
						} else if (obj.type === 'circle') {
							icon = 'circle';
						} else if (obj.type === 'polygon') {
							icon = 'draw-polygon';
						} else if (obj.type === 'line') {
							icon = 'image';
						} else if (obj.type === 'element') {
							icon = 'html5';
							prefix = 'fab';
						} else if (obj.type === 'iframe') {
							icon = 'window-maximize';
						} else if (obj.type === 'video') {
							icon = 'video';
						} else if (obj.type === 'svg') {
							icon = 'bezier-curve';
						} else {
							icon = 'image';
							title = 'Default';
						}
						let className = 'rde-canvas-list-item';
						if (selectedItem && selectedItem.id === obj.id) {
							className += ' selected-item';
						}

						// console.log('handler действия')

						// for (key in canvasRef.handler) {
						// 	console.log(key);
						//   }

						return (
							<Flex.Item
								key={obj.id}
								className={`${className} ${obj.locked ? 'rightPanelLockedItem' : ''}`}
								flex="1"
								style={{ cursor: 'pointer' }}
								onClick={() => canvasRef.handler.select(obj)}
								onMouseDown={e => e.preventDefault()}
								onDoubleClick={e => {
									canvasRef.handler.zoomHandler.zoomToCenter();
								}}
							>
								<Flex alignItems="center" className="rightPanelLayer">
									{obj.type === 'textbox' && <img src={logotext} alt="" />}
									{obj.type === 'image' && <img src={logoImage} alt="" />}
									{obj.type === 'svg' && <img src={svgLogo} alt="" />}
									{obj.type === 'logo' && <img src={logologo} alt="" />}

									<div className="rde-canvas-list-item-text" style={{ paddingLeft: '7px' }}>
										{title}
									</div>
									<Flex className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
										{/* <Button
											className="rde-action-btn"
											shape="circle"
											disabled={idCropping}
											onClick={e => {
												console.log(canvasRef.handler);
											}}
										>
											<i class="fas fa-lock"></i>
										</Button> */}
										<Button
											className="rde-action-btn"
											shape="circle"
											disabled={idCropping}
											onClick={e => {
												e.stopPropagation();
												canvasRef.handler.removeById(obj.id);
											}}
										>
											<img src={trash} alt="thrash" />
										</Button>
										<Button
											className="rde-action-btn"
											shape="circle"
											disabled={idCropping}
											onClick={e => {
												e.stopPropagation();
												canvasRef.handler.duplicateById(obj.id);
											}}
										>
											<img src={cloneImg} alt="cloneImg" />
										</Button>
									</Flex>
								</Flex>
							</Flex.Item>
						);
					})
			: null;
	};

	render() {
		const { canvasRef, selectedItem } = this.props;
		return (
			<Flex flexDirection="column">
				{this.renderActions()}
				<div className="rde-canvas-list-items">{this.renderItem()}</div>
				<Flex>
					{selectedItem && selectedItem.type === 'svg' && selectedItem.name !== 'logo' && (
						<PropertyCompanyColor canvasRef={canvasRef} selectedItem={selectedItem} />
					)}
				</Flex>
			</Flex>
		);
	}
}

export default ImageMapList;
