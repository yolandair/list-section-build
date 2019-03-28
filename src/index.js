var ComputationTime = require('@cnpm/computation-time');
var DataProcess = require('@cnpm/data-process');
var BScroll = require('@third/bscroll');
var Vue = require('@third/vue');
var ImageLazyload = require('@cnpm/image-lazyload');
var Swiper = require('@third/idangero-swiper');
require('./style.css');

var ListSectionBuild = {
    doms: { //定义一些公共DOM变量

        $moreLoading: $('#moreLoading'),
        $newLoading : $('#newLoading'),
        $goTop: $('#gotop'),
        $navListLi: $('.scroll-nav ul li'),
        $navList: $('.scroll-nav ul'),
        $scrollwrapper : document.querySelector(".scrollwrapper"),
        $topBar : $('.top-bar'),
        $scrollNav : $('.scroll-nav'),
        $bigPic : $('.big-pic'),
        $newsContent : $('.newsContent'),
        $pullupWrapper : $('.pullup-wrapper'),
        $pulldownWrapper : $('.pulldown-wrapper'),
		$languageType : $('#languageType'),
		$conOne : $('#conOne'),
		$conTwo : $('#conTwo'),
		$conThree : $('#conThree')
    },
    //定义一些公共变量
    pubVar: {
        //判断当前ajax数据是否返回完毕的数据标识
        ajaxLock: false,
        vueObj: {},
        praiseObj: {},
        dataUrl: "",
        scrollHeight : "",
    	firstitemtime : "",
    	lastitemtime : "",
    	pageNo : 1,
    	pullUpEnd : false,
        imgCutUrl : {}
	},
	getLanguageType : function() {
		var T = this;
		return T.doms.$languageType.attr("value");
	},
    getListRequestURL: function(url,pullaction) {
        var T = this,
            lastitemtime = T.pubVar.lastitemtime;
            firstitemtime = T.pubVar.firstitemtime;
        if(pullaction == "pullingUp" || pullaction == "init") {
            if(lastitemtime) {
                lastitemtime = ComputationTime.reduceOneSeconds(lastitemtime);
            } else {
                lastitemtime = ""
            }
            return url + '&before=' + lastitemtime + '&jsonpcallback=?'; 
        } else if(pullaction == "pullingDown") {
            firstitemtime = ComputationTime.addOneSeconds(firstitemtime);
            return url + '&after=' + firstitemtime + '&jsonpcallback=?'; 
        }
    },
    //获取第一页数据的ajax请求体
    getDataAjax: function(url,pullaction) {
        var T = this;
        return $.ajax({
            type: 'GET',
            url: T.getListRequestURL(url,pullaction),
            dataType: "jsonp",
            jsonp: "jsonpcallback",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            timeout: 30000
        })
    },
    setInitDataUrl : function() {
        var T = this,
        curLi = $("li.activ");
        //获取当前请求index的dataurl
        initDataUrl = curLi.attr("dataurl");
        //赋值给全局变量
        T.pubVar.dataUrl = initDataUrl; 
    },
    getData : function(pullaction) {
        var T = this,
        //获取初始化的url
            initDataUrl = T.pubVar.dataUrl; 
        //初始化为false
        T.pubVar.ajaxLock = false;
        //第一页数据请求后处理事件
        T.getDataAjax(initDataUrl,pullaction).done(function(data) {
            //如果results不存在或者results的长度为0
            if (!data.results || data.results.length == 0) {
                if(pullaction == 'pullingDown') {
					if(T.getLanguageType() == "english") {
						T.doms.$pulldownWrapper.find("span").eq(1).html("All updated")
					} else {
						T.doms.$pulldownWrapper.find("span").eq(1).html("无最新的数据");
					}
                    T.pubVar.vueObj.scroll.finishPullDown();
                } else if(pullaction == 'pullingUp'){
					if(T.getLanguageType() == "english") {
						 T.doms.$moreLoading.find('span').eq(1).html("Loaded");
					} else {
						 T.doms.$moreLoading.find('span').eq(1).html("没有更多数据了");
					}
                    T.doms.$moreLoading.find('span').eq(0).hide();
                  		    T.pubVar.pullUpEnd = true;
                }
                return;
            }
            var dataResults = new DataProcess({
			     dataArr:data.results,
                 imgCutUrl : T.pubVar.imgCutUrl
       	    });
            if(pullaction == 'init') {
                T.pubVar.vueObj.itemList = [];
                T.pubVar.vueObj.itemList = dataResults;
                T.pubVar.firstitemtime = dataResults[0].PublishedAt;
		T.pubVar.lastitemtime = dataResults[dataResults.length - 1].PublishedAt;
            } else if(pullaction == 'pullingUp') {
                dataResults.forEach(function(val, index) {
                    T.pubVar.vueObj.itemList.push(val);
                }); 
                T.doms.$pullupWrapper.fadeOut();
                //T.pubVar.vueObj.scroll.finishPullUp();
                T.pubVar.vueObj.scroll.refresh();
		T.pubVar.lastitemtime = dataResults[dataResults.length - 1].PublishedAt;
            } else if(pullaction == 'pullingDown') {
                dataResults.reverse().forEach(function(val, index) {
                    T.pubVar.vueObj.itemList.unshift(val);
                });
				if(T.getLanguageType() == "english") {
					T.doms.$pulldownWrapper.find("span").eq(1).html( dataResults.length + " items updated");
				} else {
					T.doms.$pulldownWrapper.find("span").eq(1).html( dataResults.length + "条最新数据");
				}
                T.pubVar.vueObj.scroll.finishPullDown();
                T.pubVar.vueObj.scroll.refresh();
		T.pubVar.firstitemtime = dataResults[0].PublishedAt;
            }
            T.pubVar.ajaxLock = true;
        }).fail(function() {
            return;
        });

    },
    //创建vue对象
    creatVue: function() {
        var T = this;
        var itemListObj = new Vue({
            el: '#newsList',
            data: {
                itemList: []
            },
            created : function() {

            },
            mounted: function() {
                //self指向vue对象
                T.getData("init");
                var self = this;
                 this.$nextTick(function() {
		  //只有初始化第一页的数据时需要绑定一些方法和设置一些样式
		 if(T.pubVar.pageNo == 1){
                    //首页dom加载完毕之后设置容器的高度
                    T.pubVar.scrollHeight =  (window.innerHeight-T.doms.$conOne.height()-T.doms.$conTwo.height()-T.doms.$conThree.height()) + "px";
                    T.doms.$scrollwrapper.style.height = T.pubVar.scrollHeight;
                    T.doms.$newsContent.css('height' , T.pubVar.scrollHeight);
                    T.doms.$pullupWrapper.css('bottom', '0px');
                    //初始化Scroll
                    self._initScroll(); 
                    self.pullDownAction();
                    self.pullUpAction();
                    self.scollEnd();
		 }
		 T.pubVar.pageNo = 2;
		})        
            },
            updated: function() {
				if(T.getLanguageType() == "english") {
					ComputationTime.englishDateDiff($(".time"),"data-time");
				} else {
					ComputationTime.chineseDateDiff($(".time"),"data-time");
				}
                T.imageLazyload.resetElement(document.querySelectorAll("img[data-original]"));
                T.imageLazyload.update();
            },
            methods: {
               _initScroll : function(){
                var self = this;
                    if(!self.scroll) {
                        self.scroll = new BScroll(T.doms.$scrollwrapper,{
                             scrollY: true,
                             click: true,
                             bounceTime : 2000,
                             pullDownRefresh: {
                                 threshold: 30
                                // stop: 20
                             },
                             pullUpLoad: {
                              
                             }
                        });
                    } else {
                         self.scroll.refresh();
                    }
               },

               pullDownAction : function() {
                    var self = this;

                    self.scroll.on("pullingDown",function(){
                        self.scroll.on('beforeScrollStart', function() {
							if(T.getLanguageType() == "english") {
								T.doms.$pulldownWrapper.find("span").eq(1).html("Updating");	
							} else {
								T.doms.$pulldownWrapper.find("span").eq(1).html("正在请求最新数据"); 		
							}
                         })
                        T.getData("pullingDown");              
                    })
               },

               pullUpAction : function() {
                var self = this;
                    self.scroll.on("pullingUp",function() {
			T.pubVar.vueObj.scroll.finishPullUp();
                        T.getData("pullingUp");
                    })
               },

               scollEnd : function() {
                    var self = this;
                    self.scroll.on("scrollEnd",function() {
                        T.imageLazyload.update();
                    })
               }
            }
        });
        //返回对象
        return itemListObj;
    },
    //渲染列表初始化
    init: function(params) {   
        var T = this;
        T.pubVar.imgCutUrl = params.imgCutUrl;
        //获取初始化的导航内的url
        if(params.data == "li") {
            T.setInitDataUrl();
        } else {
            T.pubVar.dataUrl = params.data; 
        }
        //创建vue对象,并且把vue对象赋值
	T.pubVar.vueObj = T.creatVue();
	//初始化轮播图的方法，一定要在创建完vue对象之后执行此方法，因为vue创建的时候会销毁原来对象中的内容后重新创建
	if(params.swiper){
		T.swiperFuc(params.swiper);
	}
        T.doms.$moreLoading = $("#moreLoading");
		
        T.imageLazyload = new ImageLazyload({
                    elements: document.querySelectorAll("img[data-original]"),
                    container : document.querySelector(".newsContent")
        });
        T.goTop();
    },
    goTop: function() { 
        var T = this;
        T.doms.$goTop.click(function() {
             T.pubVar.vueObj.scroll.scrollTo(0,0,2000);
        })
       
    },
	swiperFuc : function(params) {
        var swiper = new Swiper('.swiper-container',params)
    }
}

module.exports = ListSectionBuild;
