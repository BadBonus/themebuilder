import React, { Component } from 'react';
import { Flex } from '../flex';
import {Tooltip, Switch} from 'antd'
import arrowRight from '../../../public/images/icons/rightArrow.svg'

class ImageMapTitle extends Component {
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
							<button onClick={()=>onChangePreview(true)} className="btnOverview">overview <img src={arrowRight} alt=""/></button>
						</Tooltip>
					</div>
					<button
					className="btnNewSize"
						onClick={() => {
							const newX = +prompt('Input width', 600);
							const newY = +prompt('Input height', 400);

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

							// const {left:canvasLeft, top:canvasTop} = canvas.canvas.item(0);

							// //Найти коэфициент старый к новому

							const koefX = newX / oldX;
							const koefY = newY / oldY;

							canvas.canvas.item(0).set('height', newY);
							canvas.canvas.item(0).set('width', newX);

							// objs.map(function(o) {
							// 	console.log(o);
							// 	return o.active
							// 		? o
							// 				.set({
							// 					scaleX: o.scaleX * koefX,
							// 					scaleY: o.scaleY * koefY,
							// 					left: o.left * koefX,
							// 					top: o.top * koefY,
							// 				})
							// 				.setCoords()
							// 		: o;
							// });
							// canvas.canvas._activeObject.set('width',canvas.canvas._activeObject.width-10)
							// canvas.canvas._activeObject.set('height',canvas.canvas._activeObject.height-10)

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
						}}
					>
						New size
					</button>
				</Flex>
			)
		);
	}
}

export default ImageMapTitle;
