import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Collapse, List } from 'antd';

import PropertyDefinition from './PropertyDefinition';
import Scrollbar from '../../common/Scrollbar';
import { Flex } from '../../flex';
import ImageMapList from '../ImageMapList';
import propertiesLogo from "../../../../public/images/icons/logo_settings.svg"

const { Panel } = Collapse;

class NodeProperties extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		selectedItem: PropTypes.object,
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.selectedItem && nextProps.selectedItem) {
			if (this.props.selectedItem.id !== nextProps.selectedItem.id) {
				nextProps.form.resetFields();
			}
		}
	}

	render() {
		const { canvasRef, selectedItem, form, onChange } = this.props;
		const showArrow = false;
		return (
			<>
				<Scrollbar>
					<Form layout="horizontal" colon={false}>
						<ImageMapList canvasRef={canvasRef} selectedItem={selectedItem} onChange={onChange} form={form} />
						{selectedItem && (
							<h3 className="rightPanelPropertiesTitle">
								<img src={propertiesLogo} alt=""/> Settings
							</h3>
						)}
						<Collapse bordered={false} style={{padding:'0 11px'}}>
							{selectedItem && PropertyDefinition[selectedItem.type] ? (
								Object.keys(PropertyDefinition[selectedItem.type]).map(key => {

									return PropertyDefinition[selectedItem.type][key].component.render(
										canvasRef,
										form,
										selectedItem,
									);
									// <Panel
									// 	key={key}
									// 	header={PropertyDefinition[selectedItem.type][key].title}
									// 	showArrow={showArrow}
									// >
									// 	{PropertyDefinition[selectedItem.type][key].component.render(
									// 		canvasRef,
									// 		form,
									// 		selectedItem,
									// 	)}
									// </Panel>
								})
							) : (
								<Flex
									justifyContent="center"
									alignItems="center"
									style={{
										width: '100%',
										height: '100%',
										color: 'rgba(0, 0, 0, 0.45)',
										fontSie: 16,
										padding: 16,
									}}
								>
									<List />
								</Flex>
							)}
						</Collapse>

					</Form>
				</Scrollbar>
			</>
		);
	}
}

export default Form.create({
	onValuesChange: (props, changedValues, allValues) => {
		const { onChange, selectedItem } = props;
		onChange(selectedItem, changedValues, allValues);
	},
})(NodeProperties);
