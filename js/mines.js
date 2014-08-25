/**
 * Created by sunbin on 14-8-7.
 */
var minesNum = 0;//雷数
var colNum = 0;//列
var rowNum = 0;//行
var aMines;
var pointNum = 0;//所有方块

//初始化 根据level值设定等级
function initMines(level){

    if(level == 1){
        minesNum = 10;
        colNum = 9;
        rowNum = 9;
    }else if(level == 2){
        minesNum = 40;
        colNum = 16;
        rowNum = 16;
    }else if(level == 3){
        minesNum = 99;
        colNum = 16;
        rowNum = 20;
    }

    pointNum = colNum * rowNum;
    aMines = createMines();
    randMines();
    //console.log(aMines);

}

//生成地雷
function createMines() {
    var oMines = document.getElementById('mines');
    var str = '';
    var aMines = [];
    var indexNum = 0;
    for (var i=0; i<colNum; i++) {
        for (var j=0; j<rowNum; j++) {
            str += '<div style="width:40px; height:40px; background:rgb(233,236,239) '+ (-j*42) +'px '+ (-i*42) +'px; position:absolute; top:'+ i*42 +'px; left:'+ j*42 +'px;"></div>';
            aMines.push( {'x':i,'y':j,'index':indexNum,'isMine':false});
            indexNum++;
        }
    }

    oMines.innerHTML = str;
    return aMines;
}


//随机产生雷
function randMines(){
    var minesTmpNum = minesNum;
    var oMines = document.getElementById('mines');
    var oAllMines = oMines.getElementsByTagName('div');

    for(var i=0;i<pointNum;i++){
        var key = Math.floor(Math.random()*pointNum);
        if(!aMines[key]['isMine']&&minesTmpNum>0){
            aMines[key]['isMine'] = true;
            minesTmpNum--;
            //oAllMines[key].innerHTML = '雷';
        }
        oAllMines[i]['index'] = i;
    }

    for(var i=0;i<pointNum;i++){
        aMines[i]['minesNum'] = countSideMines(i);
    }
    //console.log(aMines);return false;
    for(var i=0;i<pointNum;i++){
        oAllMines[i].onmousedown = function(e){
            var mouseType = getButton(e);//鼠标左右键
            if(mouseType == 0||mouseType == 1){
                if(aMines[this.index]['isMine']){
                    alert('你踩到雷啦！');
                    gameOver();
                    return false;
                }else{
                    afterClick(this,aMines[this.index]['minesNum']);
                    aMines[this.index]['isRead'] = true;
                    if(aMines[this.index]['minesNum']<2){
                        sweepAround(this.index);
                    }
                    //检查是否找出所有雷区
                    checkResult();
                }
            }else if(mouseType == 2){
                if(this.innerHTML == '?'){
                    this.innerHTML = "";
                }else if(this.innerHTML == '!'){
                    this.innerHTML = "?";
                }else{
                    this.innerHTML = "!";
                }
            }

        }
    }
}

//计算当前点击块周围的雷个数
function countSideMines(index){
    var aroundMinesNum = 0;
    var x = parseInt(aMines[index]['x']);
    var y = parseInt(aMines[index]['y']);
    var aArounds = [];
    aArounds.push({'x':x,'y':y+1});
    aArounds.push({'x':x,'y':y-1});
    aArounds.push({'x':x-1,'y':y-1});
    aArounds.push({'x':x-1,'y':y+1});
    aArounds.push({'x':x-1,'y':y});
    aArounds.push({'x':x+1,'y':y});
    aArounds.push({'x':x+1,'y':y-1});
    aArounds.push({'x':x+1,'y':y+1});
    for(var i=0;i<pointNum;i++){
        for(var j=0;j<aArounds.length;j++){
            var xy = aArounds[j];
            if(aMines[i]['x']==xy['x']&&aMines[i]['y']==xy['y']&&aMines[i]['isMine']){
                aroundMinesNum++;
            }
        }
    }

    return aroundMinesNum;

}


//点开一片区域
function sweepAround(index){
    var oMines = document.getElementById('mines');
    var oAllMines = oMines.getElementsByTagName('div');
    //得到当前点击块的坐标
    var x = parseInt(aMines[index]['x']);
    var y = parseInt(aMines[index]['y']);
    var aArounds = [];
    //需要点开的坐标
    //问题 没做到像windows里面那种点开出现一片块周围雷数是0的效果 不完美 求好办法
    for(var i=0;i<2;i++){
        for(var j=0;j<2;j++){
            aArounds.push({'x':x+i,'y':y+j});
            aArounds.push({'x':x-i,'y':y-j});
            aArounds.push({'x':x,'y':y-j});
            aArounds.push({'x':x,'y':y+j});
        }
    }
    for(var i=0;i<pointNum;i++){
        for(var j=0;j<aArounds.length;j++){
            var xy = aArounds[j];
            if(aMines[i]['x']==xy['x']&&aMines[i]['y']==xy['y']&&(!aMines[i]['isMine'])){
                afterClick(oAllMines[i],aMines[i]['minesNum']);
                aMines[i]['isRead'] = true;
            }
        }
    }

}

function afterClick(obj,num){
    obj.onmousedown = '';
    obj.style.backgroundColor = 'rgb(250,245,252)';
    if(num>0){
        obj.innerHTML = num;
    }

}

//获取鼠标点击左右键
function getButton(e){
    if( e ){
        return e.button;
    }else if( window.event ){
        switch( window.event.button ){
            case 1 : return 0;             // 返回鼠标左键的值
            case 4 : return 1;             // 返回鼠标中键的值
            case 2 : return 2;             // 返回鼠标右键的值
            case 0 : return 2;             // 返回鼠标右键的值 主要是360浏览器会返回了 在IE浏览器中
        };
    };
};


//游戏结束
function gameOver(){
    var oMines = document.getElementById('mines');
    var oAllMines = oMines.getElementsByTagName('div');
    for(var i=0;i<pointNum;i++){
        //问题 这里要清除点击事件  这样写没用？
        oAllMines[i].onmousedown = function(){};
        if(aMines[i]['isMine']){
            oAllMines[i].innerHTML = '雷';
        }else{
            oAllMines[i].style.backgroundColor = 'rgb(250,245,252)' ;
        }
    }
}


function checkResult(){
    var isWin = true;
    for(var i=0;i<pointNum;i++){
        if(!aMines[i]['isRead']&&!aMines[i]['isMine']){
            isWin = false;
        }
    }
    if(isWin){
        alert('你赢啦！');
        gameOver();
    }

}
