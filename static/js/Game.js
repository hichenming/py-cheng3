var chess_svg = d3.select('#chess-grid').append('svg:svg')
					.attr('width', 430).attr('height', 430);
//棋盘边界margin
var out_width = 20;
// 每个格子多宽
var cell_width = 65;
var row_count = 6;
var col_count = 6;
// 棋子大小
var piece_width = 36;

var chess_is_init = true;  //棋盘是不是没有走动过，如果没走动，他人上线就不用重画
//不同颜色棋子数量
var pieces_count_his = 0;
var pieces_count_my = 0;
/**
 * 画6x6的棋盘
 * @return {bool} 
 */
function drawChessGrid(){
	var linecolor = 'rgb(0,0,0)';
	var bgcolor = '#DCEAF4';

	var horizontal_lines = [
		[[out_width, out_width], [out_width+row_count*cell_width, out_width]],
		[[out_width+cell_width, out_width+cell_width], [out_width+(row_count-1)*cell_width, out_width+cell_width]],
		[[out_width+2*cell_width, out_width+2*cell_width], [out_width+(row_count-2)*cell_width, out_width+2*cell_width]],

		[[out_width,out_width+3*cell_width], [out_width+2*cell_width,out_width+3*cell_width]],
		[[out_width+4*cell_width,out_width+3*cell_width], [out_width+6*cell_width,out_width+3*cell_width]],

		[[out_width+2*cell_width, out_width+4*cell_width], [out_width+(row_count-2)*cell_width, out_width+4*cell_width]],
		[[out_width+cell_width, out_width+5*cell_width], [out_width+(row_count-1)*cell_width, out_width+5*cell_width]],
		[[out_width, 6*cell_width+out_width], [out_width+row_count*cell_width, 6*cell_width+out_width]],
	];

	var vertical_lines = [
		[[out_width, out_width], [out_width, out_width+row_count*cell_width]],
		[[out_width+cell_width, out_width+cell_width], [out_width+cell_width, out_width+(row_count-1)*cell_width]],
		[[out_width+2*cell_width, out_width+2*cell_width], [out_width+2*cell_width, out_width+(row_count-2)*cell_width]],

		[[out_width+3*cell_width, out_width], [out_width+3*cell_width, out_width+2*cell_width]],
		[[out_width+3*cell_width, out_width+4*cell_width], [out_width+3*cell_width, out_width+6*cell_width]],

		[[out_width+4*cell_width, out_width+2*cell_width], [out_width+4*cell_width, out_width+(row_count-2)*cell_width]],
		[[out_width+5*cell_width, out_width+cell_width], [out_width+5*cell_width, out_width+(row_count-1)*cell_width]],
		[[out_width+6*cell_width, out_width], [out_width+6*cell_width, out_width+row_count*cell_width]],
	];

	var cross_lines = [
		[[out_width,out_width], [out_width+2*cell_width, out_width+2*cell_width]],
		[[out_width+6*cell_width,out_width], [out_width+4*cell_width, out_width+2*cell_width]],
		[[out_width,out_width+6*cell_width], [out_width+2*cell_width, out_width+4*cell_width]],
		[[out_width+6*cell_width,out_width+6*cell_width], [out_width+4*cell_width, out_width+4*cell_width]],
	];

	var lines = horizontal_lines.concat(vertical_lines).concat(cross_lines);

	for (j=0; j<lines.length; j++){
			var line = lines[j];
			var myLine = chess_svg.append("svg:line")
			    .attr("x1", line[0][0])
			    .attr("y1", line[0][1])
			    .attr("x2", line[1][0])
			    .attr("y2", line[1][1])
			    .style("stroke", linecolor)
			    .style("stroke-width", 1)
			    .attr('class', 'shape-render');
	}	

	// 初始棋子数据
	for(var i=0; i<row_count; i++){
	    Cheng3.Pieces[i] = new Array();
	    for(j=0; j<col_count; j++){
	        Cheng3.Pieces[i][j] = 0;
	    }
	}
}
/**
 * 获取当前坐标属于棋盘中的第几行几列
 * @param  {} pos 
 * @return {}     
 */
function getGridRowCol(pos){
    var cursorx = pos[0];
    var cursory = pos[1];
    var start_col = Math.ceil((cursorx-out_width) / cell_width);
    var start_row = Math.ceil((cursory-out_width) / cell_width);

    if (((cursorx-out_width) % cell_width) > (cell_width/2)) {
		start_col++;
	}
	if (((cursory-out_width) % cell_width) > (cell_width/2)) {
		start_row++;
	}

    if(start_row < 0 ) start_row = 0;
    if(start_col < 0) start_col = 0;
    if(start_row > row_count) start_row = row_count;
    if(start_col > col_count) start_col = col_count;

    return [start_row, start_col]
}

/**
 * 获取鼠标当前在棋盘里面的相对坐标
 * @param  {} e 
 * @return {}   
 */
function getCurPosition(e) {  
    var x, y; 
    if (e.pageX != undefined && e.pageY != undefined) {  
      x = e.pageX;
      y = e.pageY; 
    } else {  
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }  
    x -= $(chess_svg[0][0]).offset().left;  //兼容firefox
    y -= $(chess_svg[0][0]).offset().top;
    return [x, y];
} 

/**
 * 在第几行几列的位置上画棋子
 * @param  {int} row  从0开始
 * @param  {int} col  从0开始
 * @return {bool}     
 */
function drawPiece(row, col, color){
	var key = 'piece-'+row+'-'+col;
	row = row-1;
	col = col-1;
	var dx = out_width + col*cell_width - (cell_width-piece_width)/2;
	var dy = out_width + row*cell_width - (cell_width-piece_width)/2;
	var imgurl = piece_imgs[color-1];
	chess_svg.append('svg:image')
    	.attr('width', piece_width)
    	.attr('height', piece_width)
    	.attr('xlink:href', imgurl)
    	.attr('x', dx)
    	.attr('y', dy)
    	.attr('id', key);
    Cheng3.Pieces[row][col] = color;
}
/**
 * 选中棋子
 * @param  {event} e 
 * @return {bool}   
 */
function gameClickHandler(e){
	// if(is_waiting){
 //        return false;
 //    }
	var pos = getCurPosition(e);
	var rowcol = getGridRowCol(pos);
    var row = rowcol[0];
    var col = rowcol[1];
    console.log(row+','+col);
    // if(Cheng3.Pieces[row-1][col-1] > 0){
    // 	return false;
    // }
  	drawPiece(row, col, my_piece_color);
    	
};

$(function() {

	drawChessGrid();

	chess_svg[0][0].addEventListener("click", gameClickHandler, false);

});