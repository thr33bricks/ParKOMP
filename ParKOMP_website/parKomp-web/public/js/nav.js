//Open menu nav
function openNav() {
    if(document.documentElement.clientWidth < 769){
      document.getElementById("mySidenav").style.width = "200px";
    }
    else{
      document.getElementById("mySidenav").style.width = "250px";
    }
}

//Close menu nav
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}