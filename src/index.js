"use strict";

import * as d3 from "d3";
import BScroll from "better-scroll";

$(document).ready(function () {
//GROUP: plugins
//GROUP: Vue
	var vm = new Vue({
		el: "#whole",
		data: function () {
			return {
				//scroll
				scroll: null,
				isTop: true,
				//d3
				d3Data: [
					{
						id: 0, name: "AJAX", value: 7, _value: "很能活用", type: "FE",
						list: ["了解基礎傳輸概念", "使用 jQuery Ajax", "全域設定", "異步的 callback 操作", "傳輸的提示套件使用"]
					},
					{
						id: 1, name: "Bootstrap 4", value: 9.5, _value: "信手拈來", type: "FE",
						list: ["額外套件的使用", "整體的柵格布局", "搭配自訂 css 客製化風格", "Bootstrap hack"]
					},
					{
						id: 2, name: "RWD", value: 7.5, _value: "很能活用", type: "FE",
						list: ["基本的實作方式", "輔以 js 監聽特定狀況", "表格的 RWD 實作", "手切 RWD 版型"]
					},
					{
						id: 3, name: "SPA", value: 5, _value: "得以實作", type: "FE",
						list: ["了解基本的實現原理", "了解 SEO 的基本解決策略", "以 Vue Router 實作"]
					},
					{
						id: 4, name: "Vuejs", value: 8, _value: "熟門熟路", type: "FE",
						list: ["基本概念與實作", "理解雙向綁定的原理", "組件包裝與複用", "Vuex 的使用與操作", "Vue Router 的配置"]
					},
					{
						id: 5, name: "UI/UX", value: 7, _value: "設計感佳", type: "design",
						list: ["具備美感與基礎製圖能力", "功能的隱藏與開放判斷", "針對客群優化版面的配置", "藉個人與他人體驗加強技術"]
					},
					{
						id: 6, name: "Web App", value: 6.5, _value: "還挺上手", type: "APP",
						list: ["具有實作經驗", "盡力接近 Native App", "性能與速度上的基本優化"]
					},
					{
						id: 7, name: "Git", value: 4, _value: "基本操作", type: "manage",
						list: ["基本指令的使用", "commit 的用詞規格化", "擔心破壞專案而嚴謹版控"]
					},
					{
						id: 8, name: "Timeline", value: 6, _value: "安全範圍", type: "manage",
						list: ["幾乎都在談妥的時限前完成", "無法完成的部分會先溝通", "不會因個人拖累團體進度", "自我負責"]
					}
				],
				d3Sorts: [
					{ value: 0, txt: "預設順序排序", func: (a, b) => a.id - b.id },
					{ value: 1, txt: "熟練度升冪排序", func: (a, b) => a.value - b.value },
					{ value: 2, txt: "熟練度降冪排序", func: (a, b) => b.value - a.value }
				],
				d3Ok: false,
				d3Chart: null,
				d3Selected: null,
				d3Sorted: 0,
				//swiper
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
				//others
				vh: 0,
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
				$(this)
					.addClass("error-img")
					.attr("src", "./img/opacity.png");
			});
			//after initing doms
			this.$nextTick(() => {
				this.setScroll(); this.rwdWH(() => {
					this.changeCssRoot("--smooth-header", "0");
					let l = this.album.length + 1;
					$("#swiper").append(
						$("#album-1").clone(true)
							.attr("id", `album-${l}`)
					);
					this.sliding();
				});
			});
		},
		computed: {
			d3SelectedData: function () {
				let data = null;
				if (this.d3Selected !== null) {
					for (let i = 0; i < this.d3Data.length; i ++) {
						if (this.d3Data[i].id === this.d3Selected) {
							data = this.d3Data[i]; break;
						}
					}
				}
				return data;
			}
		},
		watch: {
			d3Sorted: function (v) {
				this.d3Chart(this.d3Sorts[v].func);
			}
		},
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
			//scroll
			setScroll: function () {
				this.scroll = new BScroll("#index", {
					bindToWrapper: true, preventDefault: false,
					disableMouse: false, disableTouch: false,
					mouseWheel: true, probeType: 3,
					scrollbar: { fade: true, interactive: true }
				});
				let panTo = e => {
					let _y = e.y * -1;
					if (_y < this.vh && _y !== 0) {
						_y < this.vh / 3 * 2 ?
							this.scroll.scrollTo(0, 0, 500)
						:	this.scrollAbout();
					}
					this.isTop = _y === 0;
				};
				let animate = e => {
					let _y = e.y * -1;
					if (_y <= this.vh / 2 && _y > this.vh / 4
					&& this.scroll.movingDirectionY === -1) {
						for (let i = 1; i <= 4; i ++) {
							let _d
							= document.getElementById(`left-${i}`);
							_d.style.removeProperty("transform");
							_d.style.animationDirection = "normal";
							_d.style.animationDuration = "750ms";
							_d.classList.remove("ani-slideup");
							void _d.offsetWidth;
							_d.classList.add("ani-slideup");
						}
					}
					this.changeCssRoot(
						"--smooth-header",
						_y < this.vh ? "0" : ".8"
					);
				};
				this.scroll.on("touchEnd", panTo);
				this.scroll.on("scrollEnd", panTo);
				this.scroll.on("scroll", animate);
			},
			scrollTop: function () {
				this.scroll.scrollTo(0, 0, 500);
			},
			scrollAbout: function () {
				this.scroll.scrollToElement(".about-container", 500);
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
						child.addEventListener("animationend", e => {
							child.style.transform = "translateY(0)";
						});
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
				let _w = $("#swiper").width(),
					_h = $("#swiper").height();
				this.albumCalc = _w > _h ? _w : _h;
				this.albumDirect = _w > _h ? "X" : "Y";
				this.d3Chart = this.drawD3Chart();
				let l = this.album.length;
				for (let i = 1; i <= l + 1; i ++) {
					$(`#album-${i}`).css(
						"transform",
						`translate${this.albumDirect}`
						+ `(${(i - 1) * this.albumCalc}px)`
					);
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
				let selected = this.albumSeleted === 1 ?
					(l + 1) : this.albumSeleted;
				this.moveSwiper(selected, true);
				(this.albumSeleted === 1) && (this.albumReload
				= setTimeout(() => this.moveSwiper(1, false), 500));
			},
			moveSwiper: function (index, ani) {
				$("#swiper")
					.css("transition", ani ? "all 300ms" : "none")
					.css(
						"transform",
						`translate${this.albumDirect}`
						+ `(${(index - 1) * this.albumCalc * -1}px)`
					);
			},
			toSwiper: function (i) {
				if (this.albumSeleted !== 0) {
					clearInterval(this.albumChanging);
					clearTimeout(this.albumReload);
					let l = this.album.length;
					this.albumSeleted = i + 1;
					this.moveSwiper(this.albumSeleted, true);
					this.setSwiperTimer();
				}
			},
		//GROUP: d3
			drawD3Chart: function () {
				//data
				const container = $("#d3-chart"), s = 40;
				const w = container.width();
				const h = this.albumDirect === "Y" ?
					400 : (60 * this.d3Data.length);
				//remove old one
				d3.select("#d3-chart>svg").remove();
				//create
				const svg = d3.select("#d3-chart").append("svg")
					.attr("width", w).attr("height", h);
				//scales
				let x, y, xAxis, yAxis, bar, valTxt;
				if (this.albumDirect === "Y") {
					x = d3.scaleBand()
						.domain(this.d3Data.map(d => d.name))
						.range([s, w - s + 5]).padding(0.2);
					y = d3.scaleLinear()
						.domain([0, 10]).range([h - s, s]);
					xAxis = g => g
						.attr("class", "lyrene-x")
						.attr("transform", `translate(0,${h - s})`)
						.call(d3.axisBottom(x).tickSizeOuter(0));
					yAxis = g => g
						.attr("class", "lyrene-y")
						.attr("transform", `translate(${s},0)`)
						.call(d3.axisLeft(y))
						.call(g => g.select(".domain").remove());
					bar = svg.append("g")
						.attr("class", "lyrene-chart")
						.selectAll("rect")
						.data(this.d3Data)
						.join("rect")
						.attr("id", d => `chart-${d.id}`)
						.attr("class", d => d.type)
						.attr("x", d => x(d.name))
						.attr("y", d => y(d.value))
						.attr("height", d => y(0) - y(d.value))
						.attr("width", x.bandwidth())
						.on("click", this.clickEvt);
					valTxt = svg.append("g")
						.attr("class", "lyrene-chart-val")
						.selectAll("text")
						.data(this.d3Data)
						.join("text")
						.attr("x", d => x(d.name) + x.bandwidth() / 2)
						.attr("y", d => y(d.value) + 20)
						.attr("text-anchor", "middle")
						.text(d => d.value);
				} else {
					x = d3.scaleLinear()
						.domain([10, 0]).range([w - s / 2, s / 2]);
					y = d3.scaleBand()
						.domain(this.d3Data.map(d => d.name))
						.range([s / 2, h - s]).padding(0.2);
					xAxis = g => g
						.attr("class", "lyrene-y")
						.attr("transform", `translate(${s},0)`)
						.call(d3.axisRight(y))
						.call(g => g.select(".domain").remove());
					yAxis = g => g
						.attr("class", "lyrene-x")
						.attr("transform", `translate(0,${h - s})`)
						.call(d3.axisBottom(x).tickSizeOuter(0));
					bar = svg.append("g")
						.attr("class", "lyrene-chart")
						.selectAll("rect")
						.data(this.d3Data)
						.join("rect")
						.attr("id", d => `chart-${d.id}`)
						.attr("class", d => d.type)
						.attr("x", d => x(0))
						.attr("y", d => y(d.name))
						.attr("height", y.bandwidth())
						.attr("width", d => x(d.value) - x(0))
						.on("click", this.clickEvt);
					valTxt = svg.append("g")
						.attr("class", "lyrene-chart-val")
						.selectAll("text")
						.data(this.d3Data)
						.join("text")
						.attr("x", d => x(d.value) - 20)
						.attr("y", d => y(d.name) + y.bandwidth() / 2)
						.attr("text-anchor", "middle")
						.attr("dominant-baseline", "middle")
						.text(d => d.value);
				}
				const gx = svg.append("g").call(xAxis);
				const gy = svg.append("g").call(yAxis);
				this.d3Ok = true; this.d3ClickDefault();
				//changing sort
				return (order) => {
					const t = svg.transition().duration(300);
					if (this.albumDirect === "Y") {
						x.domain(this.d3Data.sort(order).map(d => d.name));
						bar.data(this.d3Data, d => d.name)
							.order()
							.transition(t)
							.delay((d, i) => i * 20)
							.attr("x", d => x(d.name));
						valTxt.data(this.d3Data, d => d.name)
							.order()
							.transition(t)
							.delay((d, i) => i * 20)
							.attr("x", d => x(d.name) + x.bandwidth() / 2);
					} else {
						y.domain(this.d3Data.sort(order).map(d => d.name));
						bar.data(this.d3Data, d => d.name)
							.order()
							.transition(t)
							.delay((d, i) => i * 20)
							.attr("y", d => y(d.name));
						valTxt.data(this.d3Data, d => d.name)
							.order()
							.transition(t)
							.delay((d, i) => i * 20)
							.attr("y", d => y(d.name) + y.bandwidth() / 2);
					}
					gx.transition(t)
					.call(xAxis)
					.selectAll(".tick")
					.delay((d, i) => i * 20);
				};
			},
			clickEvt: function (d, i) {
				let parent = document.getElementsByClassName("lyrene-chart");
				if (parent[0]) {
					let cur = parent[0].querySelector(`#chart-${d.id}`);
					cur && cur.setAttribute("data-selected", "true");
					let pre = parent[0]
						.querySelector(`#chart-${this.d3Selected}`);
					(this.d3Selected !== null && this.d3Selected !== d.id && pre)
					&& pre.setAttribute("data-selected", "false");
				}
				this.d3Selected = d.id;
			},
			d3ClickDefault: function () {
				let num = this.d3Selected === null ?
					this.d3Data.length - 1 : this.d3Selected;
				let parent = document.getElementsByClassName("lyrene-chart");
				if (parent[0]) {
					let cur = parent[0].querySelector(`#chart-${num}`);
					cur && cur.setAttribute("data-selected", "true");
				}
				this.d3Selected = num;
			},
		//GROUP: contacts
			mailMe: function () {
				window.location.href = "mailto:lyreneliu@gmail.com";
			},
			goGithub: function () {
				window.open("https://github.com/LyreneLiu", "_blank");
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
			removeRightEvent: function () {
				let right = document.getElementById("index-right");
				right.removeEventListener("animationend", this._swiper);
			},
			openUndoModal: function () {
				$("#undo").modal("show");
			}
		}
	});

	var that = vm;
	
});