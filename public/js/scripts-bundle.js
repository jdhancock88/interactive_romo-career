$(document).ready(function(){}),$(document).ready(function(){function o(){$(".open-list").removeClass("open-list"),$(".open-button").removeClass("open-button")}var t=new Date,n=t.getFullYear();$(".copyright").text(n);var s=$(".header-group button");s.click(function(t){s.hasClass("open-button")===!0&&$(this).hasClass("open-button")===!0?o():(o(),$(this).addClass("open-button"),$(this).siblings("ul").addClass("open-list")),t.stopPropagation()}),$("body").click(function(){o()}),document.cookie.indexOf("DMN-P")>=0?$("body").addClass("subscribed"):$("body").removeClass("subscribed")});
//# sourceMappingURL=scripts-bundle.js.map