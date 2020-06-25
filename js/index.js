"use strict";

$(document).ready(function () {
//GROUP: scroll event
	Vue.directive("scroll", {
		inserted: function (el, binding) {
			let last = el.scrollTop, t = { o: null, h: null };
			let wait = { o: false, h: false };
			el.addEventListener("scroll", e => {
				let now = el.scrollTop;
				let v = binding.value();
				if (!wait.o && now < v.vh && now - last > 0) {
					wait.o = true;
					el.scrollTo({
						top: v.vh, behavior: "smooth"
					});
					typeof v.callback === "function"
					&& v.callback(1);
				} else if (!wait.h
				&& now - last < 0 && now < v.vh - 50) {
					wait.h = true;
					el.scrollTo({
						top: 0, behavior: "smooth"
					});
					typeof v.callback === "function"
					&& v.callback(0);
				} else if (wait.o && !t.o) {
					t.o = now === v.vh ?
					  setTimeout(() => wait.o = false, 2000)
					: setTimeout(() => wait.o = false, 1000);
				} else if (wait.h && !t.h) {
					t.h = now === 0 ?
					  setTimeout(() => wait.h = false, 2000)
					: setTimeout(() => wait.h = false, 1000);
				}
				last = now;
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
				_swiper: null,
				vh: 0,
				disabledAni: { in: false, out: false }
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
				$(this).addClass("error-img").attr("src", "./img/opacity.png");
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
					this.vh = vh;
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
						this.changeCssRoot("--display", "block");
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
							this.changeCssRoot("--display", "block");
							typeof CB === "function" && CB();
						}
					}, 500);
				}
			},
			changeCssRoot: function (property, v) {
				document.documentElement.style.setProperty(property, v);
			},
			scrolling: function () {
				return {
					vh: this.vh,
					callback: i => {
						let check = i === 0 ? "in" : "out";
						if (!this.disabledAni[check]) {
							this.disabledAni[check] = true;
							for (let j = 1; j <= 4; j ++) {
								let _d = document.getElementById(`left-${j}`);
								_d.style.animationDuration = "750ms";
								_d.style.animationDirection = i === 0 ?
									"normal" : "reverse";
								_d.classList.remove("ani-slideup");
								void _d.offsetWidth;
								_d.classList.add("ani-slideup");
							}
							setTimeout(() => {
								this.disabledAni[check] = false;
							}, 700);
						}
					}
				};
			},
			scrollAbout: function () {
				let dom = document.getElementById("index");
				dom.scrollTo({ top: this.vh, behavior: "smooth" });
			},
			removeRightEvent: function () {
				let right = document.getElementById("index-right");
				right.removeEventListener("animationend", this._swiper);
			}
		}
	});

	var that = vm;
	
});