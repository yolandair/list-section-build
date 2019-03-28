# "列表构建"

## Install

`npm install @cnpm/list-section-build`

or

`<script type="text/javascript" src="http://n3.static.pg0.cn/fp/list-section-build/dist/list-section-build.js">`

`<link rel="stylesheet" href="http://n3.static.pg0.cn/fp/list-section-build/dist/list-section-build.css" />`

## Usage

listSectionBuild.init({
	//如果传入的是li中dataurl的数据，就传li,如果传入的是数据接口本身就直接填数据接口
	data : "li",
	//如果需要支持轮播就把swiper的属性设置为true，否则为false或者不传
	swiper : true
}) 

## Example

[list-section-build](http://front.chinaso365.com/fp/list-section-build/example/index.html)

## Options

## Methods

## Events

## 0.0.1

* 初始化 list-section-build 组件

## 0.0.2

* 组件添加轮播图功能

## 0.0.3

* 修复上拉bug

## 0.0.4

* 开放轮播图传入方法,修改组件中轮播图样式 

## 0.0.5

* 组件添加传入裁切图片的参数

## 0.0.6

* 英文时间显示修改

## 0.0.7

* 修复bug

## 0.0.8

* 修复bug

## 0.0.9

* 修复publishedAt大小写错误导致的bug

## 0.1.0

* 修复由于data-process组件的bug导致的bug

## 0.1.2

* computation-time处理了英文时间的问题，data-process处理了不传裁切参数时不裁切的问题，此组件处理了加载时英文显示的问题

## 0.1.3

* computation-time组件更新

## 0.1.4

* 在页面中添加conOne,conTwo,conThree的id，方便计算滚动区域高度
