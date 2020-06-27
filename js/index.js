"use strict";

$(document).ready(function () {
//GROUP: scroll event
	Vue.directive("scroll", {
		inserted: function (el, binding) {
			let last = el.scrollTop, wait = false;
			el.addEventListener("scroll", e => {
				let v = binding.value();
				let now = el.scrollTop, _t = now < v.vh;
				typeof v.header === "function" && v.header(_t);
				if (!wait && now - last < 0 && now <= v.vh / 2) {
					wait = true;
					typeof v.callback === "function"
					&& v.callback(0);
					setTimeout(() => wait = false, 1500);
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
				disabledAni: false,
				seniority: null,
				copyrightYear: null,
				version: null
			};
		},
		mounted: function () {
			this.getVersion();
			this.getSeniority(); this.getCopyright();
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
				clearInterval(this.albumChanging);
				clearTimeout(this.albumReload);
				this.rwdWH(() => {
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
					this.changeCssRoot("--smooth-header", "0");
					let l = this.album.length + 1;
					$(".swiper-container").append(
						$("#album-1").clone(true).attr("id", `album-${l}`)
					);
					this.sliding();
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
					this.changeCssRoot("--hide-calc", "none");
					setTimeout(() => {
						this.changeCssRoot("--hide-calc", "flex");
						typeof CB === "function" && CB();
					}, 0);
				});
			},
		//GROUP: animation
			sliding: async function () {
				let i = 1; const delaySlide = t => {
					return new Promise(resolve => setTimeout(resolve, t));
				};
				this.changeCssRoot("--waiting", "block");
				while (i !== null) {
					let child = document.getElementById(`left-${i}`);
					if (child) {
						child.style.animationPlayState = "running";
						i += 1; await delaySlide(500);
					} else {
						i = null;
						let right = document.getElementById("index-right");
						right.style.animationPlayState = "running";
						right.addEventListener("animationend", this._swiper);
					}
				}
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
				}, 3500);
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
						}, 500);
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
			getSeniority: function () {
				let today = new Date();
				let year = (today.getFullYear() - 2019) * 12;
				let month = today.getMonth() - 10;
				let realY = (year + month) / 12 < 1 ? ""
				: ((year + month) / 12 + " 年");
				let realM = (year + month) % 12 === 0 ? ""
				: ((year + month) % 12 + " 個月");
				this.seniority = realY + (!!realM ? " " : "") + realM;
	
			},
			getCopyright: function () {
				let year = new Date().getFullYear();
				this.copyrightYear = year === 2020 ? "" : `-${year}`;
			},
			getVersion: function () {
				let _verReq = $.ajax({
					url:"./doc/config.json", dataType: "json"
				}).done(res => this.version = res.version)
				  .fail(err => this.version = "1.0.0");
			},
			setProperCss: function (boo, CB) {
				let lists = document.getElementsByTagName("link");
				let _m = "index-mobile.css";
				for (let i = 0; i < lists.length; i ++) {
					if (lists[i].getAttribute("href").indexOf(_m) !== -1) {
						boo && lists[i].parentNode.removeChild(lists[i]);
						this.changeCssRoot("--show-index", "block");
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
							this.changeCssRoot("--show-index", "block");
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
						if (i === 0 && !this.disabledAni) {
							this.disabledAni = true;
							for (let j = 1; j <= 4; j ++) {
								let _d = document.getElementById(`left-${j}`);
								_d.style.animationDuration = "750ms";
								_d.classList.remove("ani-slideup");
								void _d.offsetWidth;
								_d.classList.add("ani-slideup");
							}
							setTimeout(() => this.disabledAni = false, 750);
						}
					},
					header: v => {
						this.changeCssRoot("--smooth-header", v ? "0" : ".8");
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