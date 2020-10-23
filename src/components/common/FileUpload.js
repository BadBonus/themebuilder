import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon } from 'antd';
import axios from 'axios';
import { uploadImages } from '../../API';
import { v4 } from 'uuid';

const { Dragger } = Upload;

//# work FileUpload тут логика добавления файлов с раб стола происходит
class FileUpload extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		limit: PropTypes.number,
		accept: PropTypes.string,
	};

	static defaultProps = {
		limit: 5,
	};

	state = {
		fileList: this.props.value ? [this.props.value] : [],
		urlsFromServer: [],
		onLoadingImages: false,
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			fileList: nextProps.value ? [nextProps.value] : [],
		});
	}

	loadedImages = async images => {
		const { setLoadImages } = this.props;
		const newFiles = [];
		this.setState({ onLoadingImages: true });

		for (const urlImg of images) {
			const response = await fetch(urlImg);
			const url = new URL(urlImg);
			const splittingUrl = url.pathname.split('/');
			const blob = await response.blob();
			const file = new File([blob], splittingUrl[splittingUrl.length - 1], { type: blob.type });
			file.uid = v4();
			newFiles.push(file);
		}
		setLoadImages(newFiles)

		this.setState({
			fileList: newFiles,
			onLoadingImages: false,
		});
	};

	render() {
		const { accept, limit, form } = this.props;
		const { fileList } = this.state;
		const props = {
			accept,
			name: 'file',
			multiple: true,
			onChange: info => {
				const isLimit = info.file.size / 1024 / 1024 < limit;
				if (!isLimit) {
					message.error(`Limited to ${limit}MB or less`);
					return false;
				}
				const { onChange } = this.props;

				onChange(info.file);

				// form.setFields({'test':'loshara'})
			},
			onRemove: file => {
				this.setState(
					({ fileList }) => {
						const index = fileList.indexOf(file);
						const newFileList = fileList.slice();
						newFileList.splice(index, 1);
						return {
							fileList: newFileList,
						};
					},
					() => {
						const { onChange } = this.props;
						onChange(null);
					},
				);
			},
			beforeUpload: file => {
				const isLimit = file.size / 1024 / 1024 < limit;
				if (!isLimit) {
					return false;
				}
				const typeFile = file.name.match('.zip');
				if (typeFile) {
					const formData = new FormData();
					formData.append('imgCollection', file);
					axios
						.post(uploadImages, formData)
						.then(({ data }) => {
							this.loadedImages(data.imgCollection);
						})
						.catch(function(error) {
							console.log(error);
						});
				} else {
					this.setState({
						fileList: [file],
					});
				}

				return false;
			},
			fileList,
		};
		return (
			<Dragger {...props} disabled={this.state.onLoadingImages}>
				<p className="ant-upload-drag-icon">
					<Icon type="inbox" />
				</p>
				<p className="ant-upload-text">Click or drag file to this area to upload</p>
				<p className="ant-upload-hint">{`Support for a single upload. Limited to ${limit}MB or less`}</p>
			</Dragger>
		);
	}
}

export default FileUpload;
