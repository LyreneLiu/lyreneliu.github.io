"use strict";

$(document).ready(function () {
//GROUP: scroll event
	Vue.directive("scroll", {
		inserted: function (el, binding) {
			let target = null, dt = null, dist = null;
			let last = el.scrollTop, top = el.scrollTop;
			el.addEventListener("scroll", e => {
				let v = binding.value();
				let divH = v.divHeights; top = el.scrollTop;
				if (target !== null) { //when scrolling
					let check = dt > 0 ?
						(top > divH[target]) : (top < divH[target]);
					if (top === divH[target] || check) {
						el.scrollTo({ top: divH[target] });
						last = divH[target];
						target = null; dt = null; dist = null;
					} else {
						el.scrollTo({ top: top + dt * dist });
					}
				} else {
					let _i = divH.findIndex(h => h === last);
					if (_i !== -1) { //if reached the defined top or not
						if (top - last > 0 && _i !== divH.length - 1) {
							target = _i + 1; dt = 1;
							dist = (divH[_i + 1] - top) / 20;
							el.scrollTo({ top: top + dist });
							typeof v.callback === "function"
							&& v.callback(target);				
						} else if (top - last < 0 && _i !== 0) {
							target = _i - 1; dt = -1;
							dist = (top - divH[_i - 1]) / 20;
							el.scrollTo({ top: top - dist });
							typeof v.callback === "function"
							&& v.callback(target);
						}
					} else { //if in the defined top or not
						if (top - last > 0) {
							for (let i = 0; i < divH.length; i ++) {
								if (i + 1 < divH.length) {
									if (top < divH[i + 1] && top > divH[i]) {
										target = i + 1; dt = 1;
										dist = (divH[i + 1] - top) / 20;
										el.scrollTo({ top: top + dist });
										typeof v.callback === "function"
										&& v.callback(target);				
										break;		
									}
								}
							}
						} else if (top - last < 0) {
							for (let i = 0; i < divH.length; i ++) {
								if (i - 1 >= 0) {
									if (top < divH[i] && top > divH[i - 1]) {
										target = i - 1; dt = -1;
										dist = (top - divH[i - 1]) / 20;
										el.scrollTo({ top: top - dist });
										typeof v.callback === "function"
										&& v.callback(target);				
										break;
									}
								}
							}
						}
					}
					last = top <= 0 ? 0 : top;
				}
			});
		}
	});
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
				albumReload: null,
				_swiper: null
			};
		},
		mounted: function () {
			this._swiper = () => {
				this.INITswiper(); this.albumSeleted += 1;
				this.setSwiperTimer(); this.removeRightEvent();
			};
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
					this.slideLeft();
				});
			});
		},
		watch: {},
		methods: {
			//RWD height
			rwdWH: function (CB) {
				let vh = window.innerHeight, vw = window.innerWidth;
				this.setProperCss(vw > vh, () => {
					this.changeCssRoot("--vh", `${vh}px`);
					this.changeCssRoot("--flex", "none");
					setTimeout(() => {
						this.changeCssRoot("--flex", "flex");
						typeof CB === "function" && CB();
					}, 0);	
				});
			},
		//GROUP: animation
			slideLeft: function () {
				let i = 1;
				let child = document.getElementById(`left-${i}`);
				child.style.animationPlayState = "running";
				let left = setInterval(() => {
					i += 1;
					let _child = document.getElementById(`left-${i}`);
					if (_child) {
						_child.style.animationPlayState = "running";
					}
					else { clearInterval(left); this.slideRight(); }
				}, 500);
			},
			slideRight: function () {
				let right = document.getElementById("index-right");
				right.style.animationPlayState = "running";
				right.addEventListener("animationend", this._swiper);
			},
		//GROUP: swiper
			INITswiper: function () {
				let _w = $("#swiper-container").width(),
					_h = $("#swiper-container").height();
				this.albumCalc = _w > _h ? _w : _h;
				this.albumDirect = _w > _h ? "X" : "Y";
				let l = this.album.length;
				for (let i = 1; i < l + 1; i ++) {
					this.moveSwiper(i + 1, this.albumCalc * i, false);
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
						}, 2000);
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
		//GROUP: others
			setProperCss: function (boo, CB) {
				let lists = document.getElementsByTagName("link");
				let _m = "index-mobile.css";
				for (let i = 0; i < lists.length; i ++) {
					if (lists[i].getAttribute("href").indexOf(_m) !== -1) {
						boo && lists[i].parentNode.removeChild(lists[i]);
						typeof CB === "function" && CB();
						return;
					}
				}
				if (boo) { typeof CB === "function" && CB(); } else {
					let link = document.createElement("link");
					link.rel = "stylesheet"; link.type = "text/css";
					link.href = `./css/${_m}`;
					document.getElementsByTagName("head")[0].appendChild(link);
					let check = setInterval(() => {
						if (!!link.sheet && !!link.sheet.cssRules) {
							clearInterval(check);
							typeof CB === "function" && CB();
						}
					}, 100);
				}
			},
			changeCssRoot: function (property, v) {
				document.documentElement.style.setProperty(property, v);
			},
			scrolling: function () {
				return {
					divHeights:  [
						0, Number(
							getComputedStyle(document.documentElement)
								.getPropertyValue("--vh").replace("px", "")
						)
					],
					callback: i => {
						if (i === 0) {
							for (let j = 1; j <= 4; j ++) {
								let _d = document.getElementById(`left-${j}`);
								_d.classList.remove("ani-slideup");
								void _d.offsetWidth;
								_d.classList.add("ani-slideup");
							}
							let _r = document.getElementById("index-right");
							_r.classList.remove("ani-slidedown");
							void _r.offsetWidth;
							_r.classList.add("ani-slidedown");
						}
					}
				};
			},
			scrollAbout: function () {
				let el = document.getElementById("index");
				el.scrollTo({ top: el.scrollTop + 5 });
			},
			removeRightEvent: function () {
				let right = document.getElementById("index-right");
				right.removeEventListener("animationend", this._swiper);
			}
		}
	});

	var that = vm;
	
});