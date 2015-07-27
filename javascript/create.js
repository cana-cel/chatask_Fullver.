$('.addbutton').on("click", addMember);
function addMember () {
    $('.memberlist').append('<li class="member"><input class="inputtext" type="text" name="name"><button class="deletebutton" type="button">delete</button></li>');
};

$(document).on("click", ".member button", deleteHandler);
function deleteHandler() {
    var li = $(this).closest("li");
    li.remove();
    var br = $(this).closest("br");
    br.remove();
};