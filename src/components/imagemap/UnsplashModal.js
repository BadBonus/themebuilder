import React, { Component } from 'react';
import axios from 'axios';
import { v4 } from 'uuid';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Input } from 'antd';

export default class UnsplashModal extends Component {
	state = {
		images: [],
		loaded: false,
		hasMore: true,
		searchText: '',
		searchOldText: '',
		numberPage: 1,
		total: 500,
	};

	timeout = 0;

	fetchImages = (count = 10) => {
		const { searchText, numberPage, searchOldText, total, images } = this.state;

		this.setState({ loaded: true });
		const apiRoot = 'https://api.unsplash.com';
		const accessKey = 'IJZIrVe43Hi3qaCS0u-0lpU6bIZpV8ddFKo96JMocy0';
		if (searchText) {
			if (searchText !== searchOldText) {
				axios
					.get(
						`${apiRoot}/search/photos?client_id=${accessKey}&per_page=${count}&query=${searchText}&page=${1}`,
					)
					.then(({ data: { results, total } }) => {
						this.setState({
							images: results,
							loaded: false,
							searchOldText: searchText,
							total,
							numberPage: 2,
						});
					});
			} else {
				if (this.state.images.length >= total) {
					this.setState({ hasMore: false });
					return;
				} else {
					this.setState({ hasMore: true });
				}

				axios
					.get(
						`${apiRoot}/search/photos?client_id=${accessKey}&per_page=${count}&query=${searchText}&page=${numberPage}`,
					)
					.then(({ data: { results, total } }) => {
						this.setState({
							images: [...images, ...results],
							loaded: false,
							searchOldText: searchText,
							total,
							numberPage: numberPage + 1,
						});
					});
			}
		} else {
			if (this.state.images.length >= 500) {
				this.setState({ hasMore: false });
				return;
			} else {
				this.setState({ hasMore: true });
			}
			axios.get(`${apiRoot}/photos/random?client_id=${accessKey}&count=${count}`).then(res => {
				const data = res.data.map(el => ({ ...el, id: el.id + Math.random() }));
				const updatedImages = searchOldText !== '' ? data : images.concat(data);
				this.setState({ images: updatedImages, loaded: false, searchOldText: '' });
			});
		}
	};

	// fetchMoreData = () => {
	// 	if (this.state.items.length >= 500) {
	// 	  this.setState({ hasMore: false });
	// 	  return;
	// 	}
	// 	// a fake async api call like which sends
	// 	// 20 more records in .5 secs
	// 	setTimeout(() => {
	// 	  this.setState({
	// 		items: this.state.items.concat(Array.from({ length: 20 }))
	// 	  });
	// 	}, 500);
	//   };

	doSearch(e) {
		var searchText = e.target.value; // this is the search text

		this.setState({ searchText });

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.fetchImages(10);
		}, 300);
	}

	//lifecicle methods
	componentDidMount() {
		this.fetchImages();
	}

	render() {
		const { images, loaded, hasMore } = this.state;

		const { onAddItem, close, selectedItem } = this.props;

		return (
			<div className="imageChooser">
				<div className="imageChooser__title">
					<span>Unsplash</span>
					<button onClick={close}>
						<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="13.4351" width="1" height="19" transform="rotate(45 13.4351 0)" fill="#A7A7A7" />
							<rect
								y="0.707153"
								width="1"
								height="19"
								transform="rotate(-45 0 0.707153)"
								fill="#A7A7A7"
							/>
						</svg>
					</button>
				</div>
				<Input placeholder="Search" onChange={evt => this.doSearch(evt)} />

				<div className="imageChooser__content" id="imageChooser__content">
					{selectedItem && selectedItem.type === 'image' ? (
						<InfiniteScroll
							dataLength={images.length}
							next={this.fetchImages}
							hasMore={hasMore}
							loader={<h4>Loading...</h4>}
							height={480}
							scrollableTarget="imageChooser__content"
							endMessage={
								<p style={{ textAlign: 'center' }}>
									<b>Yay! You have seen it all</b>
								</p>
							}
						>
							{images.map(image => (
								<img
									src={image.urls.thumb}
									key={image.id}
									className="imageChooser__item"
									onClick={() => onAddItem(image.urls.thumb)}
								/>
							))}
						</InfiniteScroll>
					) : (
						<h3>Please choose an image (not svg) </h3>
					)}

					{/* {
									images.map((image, index) => (
										<img
											src={image}
											key={index}
											onClick={()=>onAddItem(image)}
											className="imageChooser__item"
										/>
								  ))
								} */}
				</div>
			</div>
		);
	}
}
