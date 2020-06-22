"use strict";

$(document).ready(function () {

	var vm = new Vue({
		el: "#index",
		data: function () {
			return {
				album: [
					{ name: "album-1.JPG", text: "ME" },
					{ name: "album-2.JPG", text: "OUTGOING" },
					{ name: "album-3.JPG", text: "MY FAVORITE" },
					{ name: "album-4.JPG", text: "SWEET TOOTH" },
					{ name: "album-5.JPG", text: "HAPPINESS" }
				],
				albumH: null,
				albumSeleted: 0,
				albumChanging: null,
				albumReload: null
			};
		},
		mounted: function () {
			$("img").one("error", function (e) {
				$(this)
					.css("width", "50px")
					.css("height", "50px")
					.css("top", "calc(50% - 25px)")
					.attr("src", "./img/loading.svg");
			});
			this.$nextTick(() => {
				this.INITswiper();
				let childs = $(".index-left :nth-child(n)");
				childs.css("transform", "translateY(0)");
				setInterval(() => childs.css("opacity", "1"), 500);
			});
		},
		watch: {
		},
		methods: {
		//GROUP: swiper
			INITswiper: function () {
				this.albumH = $(".swiper-container").height();
				let l = this.album.length;
				$(".swiper-container")
					.append($(".swiper-container :nth-child(1)").clone(true));
				for (let i = 1; i < l + 1; i ++) {
					this.moveSwiper(i + 1, this.albumH * i, true);
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
				let _selected = this.albumSeleted === 1 ?
					(l + 1) : this.albumSeleted;
				for (let i = 1; i <= l + 1; i ++) {
					let reduce = (i - _selected) * this.albumH;
					this.moveSwiper(i, reduce, true);
					if (this.albumSeleted === 1 && i === _selected) {
						this.albumReload = setTimeout(() => {
							for (let j = 1; j <= l + 1; j ++) {
								let _reduce = (j - 1) * this.albumH;
								this.moveSwiper(j, _reduce, false);
								}		
						}, 3500);
					}
				}
			},
			moveSwiper: function (index, re, ani) {
				$(".swiper-container :nth-child(" + index + ")")
					.css("transition", ani ? "all 300ms" : "none")
					.css("transform", "translateY(" + re + "px)");
			},
			toSwiper: function (i) {
				clearInterval(this.albumChanging);
				clearTimeout(this.albumReload);
				let l = this.album.length;
				this.albumSeleted = i + 1;
				for (let j = 1; j < l + 1; j ++) {
					let reduce = (j - i - 1) * this.albumH;
					this.moveSwiper(j, reduce, true);
				}
				this.setSwiperTimer();
			}
		}
	});

	var that = vm;
	
});