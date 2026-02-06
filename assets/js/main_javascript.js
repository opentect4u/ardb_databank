


var hambarMobileOpenBtn = document.getElementById('hambarMobileOpenBtn');
var resMenuPanel = document.querySelector('.resMenuPanel');
var resHambarClose = document.querySelector('.resHambarClose');

if(hambarMobileOpenBtn){
hambarMobileOpenBtn.onclick = function(){
  resMenuPanel.style.transform = 'translateX(0)';
}
}


if(resHambarClose){
resHambarClose.onclick = function(){
  resMenuPanel.style.transform = 'translateX(-320px)';
}
}





//
//var searchBtn = document.querySelector('.searchBtn');
//var serachBoxTop = document.querySelector('.serachBoxTop');
//
//searchBtn.onclick = function(){
//	
//	serachBoxTop.classList.toggle("mystyle");
//	
//}


var profileThum = document.querySelector('.profileThum');

//profileThum.onclick = function(){
//	var element = document.getElementById("myDropdown");
//
//	element.classList.toggle("show");
//}

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


// var pieChartId = document.getElementById("pieChart");

// if (pieChartId) {
//   var ctxP = document.getElementById("pieChart").getContext('2d');

//   var myPieChart = new Chart(ctxP, {
//     type: 'pie',
//     data: {
//       labels: ["Car", "Byke", "Skuti"],
//       datasets: [{
//         data: [300, 50, 100],
//         backgroundColor: ["#3869df", "#ff4562", "#3bc47e", "#949FB1", "#4D5360"],
//         hoverBackgroundColor: ["#597aca", "#e26b7e", "#5edc9c", "#A8B3C5", "#616774"]
//       }]
//     },
//     options: {
//       responsive: true
//     }
//   });
// }


// var pieChartId_2 = document.getElementById("pieChart_2");

// if (pieChartId_2) {
//   var ctxP = document.getElementById("pieChart_2").getContext('2d');

//   var myPieChart = new Chart(ctxP, {
//     type: 'pie',
//     data: {
//       labels: ["Byke", "Car", "Skuti"],
//       datasets: [{
//         data: [300, 50, 100],
//         backgroundColor: ["#3869df", "#ff4562", "#3bc47e", "#949FB1", "#4D5360"],
//         hoverBackgroundColor: ["#597aca", "#e26b7e", "#5edc9c", "#A8B3C5", "#616774"]
//       }]
//     },
//     options: {
//       responsive: true
//     }
//   });
// }



// //bar
// var barChartId = document.getElementById("barChart");
// if (barChartId) {
//   var ctxB = document.getElementById("barChart").getContext('2d');
//   var myBarChart = new Chart(ctxB, {
//     type: 'bar',
//     data: {
//       labels: ["JAN", "FEB", "MAR", "APR"],
//       datasets: [{
//         label: '# of Votes',
//         data: [12, 19, 3, 5],
//         backgroundColor: ["#3869df", "#ff4562", "#3bc47e", "#949FB1", "#4D5360"],
//         borderWidth: 1
//       }]
//     },
//     options: {
//       scales: {
//         yAxes: [{
//           ticks: {
//             beginAtZero: true
//           }
//         }]
//       }
//     }
//   });
// }




















