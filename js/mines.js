/**
 * Created by sunbin on 14-8-7.
 */

var minesNum  = 0;//雷数
var leaveNum  = 0;//剩余雷数
var colNum    = 0;//列
var rowNum    = 0;//行
var aMines    = [];//存放雷信息数组
var aPoints   = {};//坐标
var pointNum  = 0;//所有方块
var minesTmpNum = 0;
var oMines;       //雷区块对象
var oAllMines;    //所以雷对象
var timer;
//初始化 根据level值设定难度等级
function initMines(level){
    minesNum = 0;
    aMines = [];
    aPoints = {}
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
    oNum.innerHTML = minesNum;
    leaveNum = minesNum;
    pointNum = colNum * rowNum;
    createMines();
    randMines();
    timeCounter();
}

//生成地雷
function createMines() {
    oMines = document.getElementById('mines');
    oAllMines = oMines.getElementsByTagName('div');
    var str = '';
    var indexNum = 0;

    for (var i=0; i<colNum; i++) {
        for (var j=0; j<rowNum; j++) {
            str += '<div style="width:40px; height:40px; background:rgb(233,236,239) '+ (-j*42) +'px '+ (-i*42) +'px; position:absolute; top:'+ i*42 +'px; left:'+ j*42 +'px;"></div>';
            //雷信息数组 存放 x,y轴，索引值，是否是雷
            aMines.push( {'x':i,'y':j,'index':indexNum,'isMine':false,'setMine':0});
            //坐标json
            aPoints[i+''+j] = indexNum;
            indexNum++;
        }
    }

    oMines.innerHTML = str;
}


//随机产生雷
function randMines(){
    minesTmpNum = minesNum;
    for(var i=0;i<pointNum;i++){
        var key = Math.floor(Math.random()*pointNum);
        if(!aMines[key]['isMine']&&minesTmpNum>0){
            aMines[key]['isMine'] = true;
            minesTmpNum--;
        }
        oAllMines[i]['index'] = i;
    }
    //计算所有格子周围的雷数
    for(var i=0;i<pointNum;i++){
        aMines[i]['minesNum'] = countSideMines(i);
    }
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
                    //如果周围没有雷 就展开一片区域
                    if(aMines[this.index]['minesNum']==0){
                        //需要点开的坐标
                        var x = parseInt(aMines[this.index]['x']);
                        var y = parseInt(aMines[this.index]['y']);
                        openAreaPoint(x,y);
                    }
                    //检查是否找出所有地雷
                    checkResult();
                }
            }else if(mouseType == 2){
                if(aMines[this.index]['setMine'] == -2){
                    this.innerHTML = "";
                    aMines[this.index]['setMine'] = 0;
                    this.style.className = '';
                }else if(aMines[this.index]['setMine'] == true){
                    this.innerHTML = "?";
                    this.style.className = '';
                    leaveNum++;
                    aMines[this.index]['setMine'] = -2;
                }else if(aMines[this.index]['setMine'] == 0){
                    this.innerHTML = "<img style='margin: 1px;opacity: 0.6' src='images/isminer.png' width='38' height='38'>";
                    this.className = 'isMine';
                    leaveNum--;
                    aMines[this.index]['setMine'] = true;
                }
                if(leaveNum>=0&&leaveNum<=minesNum){
                    oNum.innerHTML = leaveNum;
                }
                //检查是否找出所有雷区
                checkResult();
            }

        }
    }
}

//计算当前点击块周围的雷个数
function countSideMines(index){
    var aroundMinesNum = 0;
    var x = parseInt(aMines[index]['x']);
    var y = parseInt(aMines[index]['y']);
    var aArounds = getAreaPoint(x,y);
    for(var i=0;i<aArounds.length;i++){
        if(aArounds[i]['x']>=0&&aArounds[i]['y']>=0){
            var index = aPoints[aArounds[i]['x']+''+aArounds[i]['y']];
            if(index>=0){
                if(aMines[index]['isMine']){
                aroundMinesNum++;
                }
            }
        }
    }

    return aroundMinesNum;

}

//点击之后的效果
function afterClick(obj,num){
    obj.onmousedown = '';
    //obj.style.opacity = 0.3;
    //changeOpacity(obj);
    obj.style.backgroundColor = 'rgb(250,245,252)';
    if(num>0){
        obj.innerHTML = num;
    }else{
        obj.innerHTML = '';
    }

}

//渐变
function changeOpacity(obj){
    obj.timer = setInterval(function(){
        if(obj.style.opacity<=1){
            obj.style.opacity += 0.02;
        }else{
            clearInterval(obj.timer);
        }
    },5);
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
    clearInterval(timer);
    for(var i=0;i<pointNum;i++){
        //问题 这里要清除点击事件  这样写没用？
        oAllMines[i].onmousedown = function(){};
        if(aMines[i]['isMine']){
            //oAllMines[i].innerHTML = '雷';
            oAllMines[i].innerHTML = "<img style='margin: 1px' src='images/isminer.png' width='38' height='38'>";
        }else{
            oAllMines[i].innerHTML = '';
            oAllMines[i].style.backgroundColor = 'rgb(250,245,252)' ;
        }
    }
}


//获取周围8个区域
function  getAreaPoint(x,y){
    var aArounds = [];
    aArounds.push({'x':x,'y':y+1});
    aArounds.push({'x':x,'y':y-1});
    aArounds.push({'x':x-1,'y':y-1});
    aArounds.push({'x':x-1,'y':y+1});
    aArounds.push({'x':x-1,'y':y});
    aArounds.push({'x':x+1,'y':y});
    aArounds.push({'x':x+1,'y':y-1});
    aArounds.push({'x':x+1,'y':y+1});
    return aArounds;
}


//点开一片区域
function openAreaPoint(x,y){
    var aArounds = getAreaPoint(x,y);
    for(var i=0;i<aArounds.length;i++){
        var index = aPoints[aArounds[i]['x']+''+aArounds[i]['y']];
        if(index>=0){
            if(!aMines[index]['isMine']){
                //如果周围没有雷 并且没有翻开过 就递归调用 继续展开区域
                if(aMines[index]['minesNum']==0&&!aMines[index]['isRead']){
                    afterClick(oAllMines[index],aMines[index]['minesNum']);
                    aMines[index]['isRead'] = true;
                    openAreaPoint(aArounds[i]['x'],aArounds[i]['y']);
                }else{
                    afterClick(oAllMines[index],aMines[index]['minesNum']);
                    aMines[index]['isRead'] = true;
                }
            }
        }
    }
}

//检查游戏结果
function checkResult(){
    var isWin = true;
    for(var i=0;i<pointNum;i++){
        if(!aMines[i]['isRead']&&(aMines[i]['setMine']!=true)){
            isWin = false;
        }
    }
    if(isWin){
        alert('你赢啦！');
        gameOver();
    }
}

//时间
function timeCounter(){
    clearInterval(timer);
    var time = document.getElementById('time');
    var seconds = 0;
    timer = setInterval(function(){
        if(seconds>9999){
            gameOver();
        }
        time.innerHTML = seconds++;
    },1000)
}
