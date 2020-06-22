"use strict";

$(document).ready(function () {

	var vm = new Vue({
		el: "#index",
		data: function () {
			return {
				album: [
					{ name: "album-1.jpg", text: "ME" },
					{ name: "album-2.jpg", text: "OUTGOING" },
					{ name: "album-3.jpg", text: "MY FAVORITE" },
					{ name: "album-4.jpg", text: "SWEET TOOTH" },
					{ name: "album-5.jpg", text: "HAPPINESS" }
				],
				albumH: null,
				albumSeleted: 0,
				albumChanging: null,
				albumReload: null
			};
		},
		mounted: function () {
			this.$nextTick(this.INITswiper);
		},
		watch: {
		},
		methods: {
			INITswiper: function () {
				this.albumH = $(".swiper-container").height();
				let l = this.album.length;
				$(".swiper-container")
					.append($(".swiper-container :nth-child(1)").clone(true));
				for (let i = 1; i < l + 1; i ++) {
					let dom = $(".swiper-container :nth-child(" + (i + 1) + ")");
					dom
						.css("transition", "all 300ms")
						.css("transform", "translateY(" + this.albumH * i + "px)");
				}
				this.albumSeleted += 1;
				this.setSwiperTimer();
			},
			setSwiperTimer: function () {
				let l = this.album.length;
				this.albumChanging = setInterval(() => {
					this.albumSeleted += this.albumSeleted < l ? 1 : (-l + 1);
					this.activeSwiper();
				}, 4000);
			},
			activeSwiper: function () {
				let l = this.album.length;
				let _selected = this.albumSeleted === 1 ? (l + 1) : this.albumSeleted;
				for (let i = 1; i <= l + 1; i ++) {
					let reduce = (i - _selected) * this.albumH;
					$(".swiper-container :nth-child(" + i + ")")
						.css("transition", "all 300ms")
						.css("transform", "translateY(" + reduce + "px)");
					if (this.albumSeleted === 1 && i === _selected) {
						this.albumReload = setTimeout(() => {
							for (let j = 1; j <= l + 1; j ++) {
								let _reduce = (j - 1) * this.albumH;
									$(".swiper-container :nth-child(" + j + ")")
										.css("transition", "none")
										.css("transform", "translateY(" + _reduce + "px)");		
								}		
						}, 3500);
					}
				}
			},
			toSwiper: function (i) {
				clearInterval(this.albumChanging);
				clearTimeout(this.albumReload);
				this.albumSeleted = i + 1;
				this.activeSwiper();
				this.setSwiperTimer();
			}
		}
	});

	var that = vm;
	
});