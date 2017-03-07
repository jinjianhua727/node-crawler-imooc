var http = require("http")
var Promise = require('bluebird')
var cheerio = require("cheerio")
var url = "http://www.imooc.com/learn/348"
var baseUrl = "http://www.imooc.com/learn/"
var baseNumUrl = 'http://www.imooc.com/course/AjaxCourseMembers?ids='
videoIds = [348,259,197,134,75]

function filterChapters (html){
	var $ = cheerio.load(html)
	var chapters = $(".chapter ")

	var title = $(".hd h2").text()
	// var number = parseInt($(".meta-value.js-learn-num").text(),10)
	
	// {
	// 	title:title,
	// 	number :number
	// 	videos : [{
	// 		chapterTitle : "",
	// 		videos:[
	// 			{
	// 				title : "",
	// 				id : ""
	// 			}
	// 		]
	// 	}]
	// }
	
	
	var courseData = {
		title : title,
		// number :number,
		videos : []
	};
	chapters.each(function(){
		var chapter = $(this);
		chapter.find("strong").find(".chapter-info").remove()
		var chapterTitle = chapter.find("strong").text();
		var videos = chapter.find(".video").children("li");
		var chapterData = {
			chapterTitle : chapterTitle,
			videos :[]
		}

		videos.each(function(){
			var video = $(this).find(".J-media-item")
			var videoTitle = video.text();
			var id = video.attr("href").split("video/")[1]
			chapterData.videos.push({
				title : videoTitle,
				id : id
			})
		})
		courseData.videos.push(chapterData)
	})
	return courseData;
}
function printCourseInfo(data) {
	// data.forEach(function (courseData) {
	// 	console.log(courseData.number + "人学过" + courseData.title)
	// })
	data.forEach(function(item){
		console.log('###' + item.title)
		item.videos.forEach(function (i) {
			var chapterTitle = i.chapterTitle;
			console.log(chapterTitle.replace(/\s/g, ""))

			i.videos.forEach(function(video){
				console.log(" 【" +video.id+"】 " +video.title.replace(/\s/g, ""))
			})
			
		})
	})
}

function getPageAsync(url) {
	return new Promise(function (resolve,reject) {
		console.log("正在爬取")

		http.get(url,function(res){
			var html = "";
			res.on("data",function(data){
				html += data;
			})
			res.on("end",function(){
				resolve(html)
			})
		}).on("error",function(){
			reject(e)
			console.log("获取课程信息失败")
		})
	})
}

var fetchCourseArray = []
videoIds.forEach(function (id) {
	fetchCourseArray.push(getPageAsync(baseUrl +id))
	
})
Promise
	.all(fetchCourseArray)
	.then(function (pages) {
		var coursesData = []

		pages.forEach(function (html) {
			var courses = filterChapters(html)
			coursesData.push(courses)
		})

		coursesData.sort(function (a,b) {
			return a.number < b.number
		})

		printCourseInfo(coursesData)
	})