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
				albumCalc: null,
				albumDirect: "Y",
				albumSeleted: 0,
				albumChanging: null,
				albumReload: null
			};
		},
		mounted: function () {
			//prevent mobile user resizing the web
			let lastTouchEnd = 0;
			document.addEventListener("touchstart", event => {
				event.touches.length > 1 && event.preventDefault();
			}, { passive: false });
			document.addEventListener("touchend", event => {
				const now = (new Date()).getTime();
				now - lastTouchEnd <= 300 && event.preventDefault();
				lastTouchEnd = now;
			}, false);
			//resize event (on computer web)
			window.addEventListener("resize", () => {
				this.rwdWH(() => {
					clearInterval(this.albumChanging);
					clearTimeout(this.albumReload);
					this.INITswiper();
					this.toSwiper(this.albumSeleted - 1);
				});
			});
			//img can't be loaded
			$("img").one("error", function (e) {
				$(this).addClass("error-img").attr("src", "./img/loading.svg");
			});
			//after initing doms
			this.$nextTick(() => {
				this.rwdWH(() => {
					let l = this.album.length + 1;
					$(".swiper-container").append(
						$("#album-1").clone(true).attr("id", `album-${l}`)
					);
					this.INITswiper(); this.slideLeft();
				});
			});
		},
		watch: {},
		methods: {
			//RWD height
			rwdWH: function (CB) {
				let vh = window.innerHeight;
				document.documentElement.style.setProperty("--vh", `${vh}px`);
				document.documentElement.style.setProperty("--flex", "none");
				setTimeout(() => {
					document.documentElement.style.setProperty("--flex", "flex");
					typeof CB === "function" && CB();
				}, 0);
			},
		//GROUP: animation
			slideLeft: function () {
				let i = 1;
				let child = document.getElementById(`left-${i}`);
				child.style.transform = `translate${this.albumDirect}(0)`;
				setTimeout(() => child.style.opacity = "1", 500);
				let left = setInterval(() => {
					i += 1;
					let _child = document.getElementById(`left-${i}`);
					if (_child) {
						_child.style.transform = `translate${this.albumDirect}(0)`;
						setTimeout(() => _child.style.opacity = "1", 500);
					} else {
						clearInterval(left); this.slideRight();
					}
				}, 500);
			},
			slideRight: function () {
				setTimeout(() => {
					let right = document.getElementById("index-right");
					right.style.transform = `translate${this.albumDirect}(0)`;
					setTimeout(() => {
						right.style.opacity = "1";
						setTimeout(() => {
							this.albumSeleted += 1; this.setSwiperTimer();
						}, 500);
					}, 500);
				}, 500);
			},
		//GROUP: swiper
			INITswiper: function () {
				let _w = $("#swiper-container").width(),
					_h = $("#swiper-container").height();
				this.albumCalc = _w > _h ? _w : _h;
				this.albumDirect = _w > _h ? "X" : "Y";
				let l = this.album.length;
				for (let i = 1; i < l + 1; i ++) {
					this.moveSwiper(i + 1, this.albumCalc * i, true);
				}
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
					let reduce = (i - _selected) * this.albumCalc;
					this.moveSwiper(i, reduce, true);
					if (this.albumSeleted === 1 && i === _selected) {
						this.albumReload = setTimeout(() => {
							for (let j = 1; j <= l + 1; j ++) {
								let _reduce = (j - 1) * this.albumCalc;
								this.moveSwiper(j, _reduce, false);
								}		
						}, 3500);
					}
				}	
			},
			moveSwiper: function (index, re, ani) {
				$("#album-" + index)
					.css("transition", ani ? "all 300ms" : "none")
					.css("transform", `translate${this.albumDirect}(${re}px)`);
			},
			toSwiper: function (i) {
				if (this.albumSeleted !== 0) {
					clearInterval(this.albumChanging);
					clearTimeout(this.albumReload);
					let l = this.album.length;
					this.albumSeleted = i + 1;
					for (let j = 1; j < l + 1; j ++) {
						let reduce = (j - i - 1) * this.albumCalc;
						this.moveSwiper(j, reduce, true);
					}
					this.setSwiperTimer();
				}
			},
		//GROUP: swiper
			
		}
	});

	var that = vm;
	
});