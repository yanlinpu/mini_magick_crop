//图片上传  2015-6-12 by liwz
$(function(){
    var jcrop_api;
    var realw,realh,scaling;
    var image_url,$this;
    var scale = 3/2;
    var setYVal=50, setYVal2=210;
    $('.edita').click(function(){
        var oBody = document.getElementsByTagName('body')[0],
            pageH = $(document).height();
        $this=$(this);
        //ProductPrincipal 1:1正方形
        if($this.attr('pic_type')=='ProductPrincipal'){
            scale = 1/1;
            setYVal = 60;
            setYVal2 = 300;
            $('.crop_tip01').text('240x240');
            $('.crop_tip02').text('180x180');
            $('.pictures_con .compic_view01').css('height','272px');
            $('.pictures_con .compic_view01 .compic_view01_con').css('height','240px');
            $('.pictures_con .compic_view02').css('height','212px');
            $('.pictures_con .compic_view02 .compic_view02_con').css('height','180px');
        }else{  //product 3:2 长方形
            scale = 3/2;
            setYVal = 50;
            setYVal2 = 210;
            $('.crop_tip01').text('240x160');
            $('.crop_tip02').text('180x120');
            $('.pictures_con .compic_view01').css('height','192px');
            $('.pictures_con .compic_view01 .compic_view01_con').css('height','160px');
            $('.pictures_con .compic_view02').css('height','152px');
            $('.pictures_con .compic_view02 .compic_view02_con').css('height','120px');
            //console.log( jcrop_api.tellSelect());
        }
        if(!document.getElementById('popup_mask'))
        {
            var oMask = document.createElement('div');
            oMask.id = 'popup_mask';
            oMask.style.height = pageH+'px';
            oBody.appendChild(oMask);
        }
        document.getElementById('popup_mask').style.display = 'block';
        $('#edit_compic').show();
        var p_type = $(this).attr('pic_type');
        var p_id = $(this).attr('p_id');
        getPic();
    });
    function getPic(){
        $.ajax({
            type: "get",
            url: "/products/product_logo",
            dataType: "json",
            data:{'pic_type':$this.attr('pic_type'),"pic_id":$this.attr('p_id')},
            success: function(data){
                image_url = data.url;
                var personpic_url =  data.url;
                var oImg = new Image();
                oImg.onload = function()
                {
                    realw = this.width;
                    realh = this.height;
                    scaling = realw/350;
                    var setx = Math.round(60*scaling);   //
                    var sety = Math.round(setYVal*scaling);
                    var setx2 = Math.round(300*scaling);
                    var sety2 = Math.round(setYVal2*scaling);
                    //console.log($('#cropbox')[0]);
                    $('#cropbox')[0].src = this.src;
                    $('#crop_view01')[0].src = this.src;
                    $('#crop_view02')[0].src = this.src;
                    $(".jcrop-holder").find('img').attr('src',this.src);
                    //console.log(realw);
                    //console.log(realh);
                    $(".jcrop-holder").css("width",realw);
                    $(".jcrop-holder").css("height",realh);
                    $(".jcrop-tracker").css("width",realw);
                    $(".jcrop-tracker").css("height",realh);
                    //console.log($(".jcrop-tracker"));
                    $(".jcrop-holder").find('img').css('width',realw);
                    $(".jcrop-holder").find('img').css('height',realh);
                    //clearInfo();
                    //console.log("setx:"+setx+"|"+"sety:"+sety+"|"+"setx2:"+setx2+"|"+"sety2:"+sety2+'sdd');


                    //jcrop_api.destroy();
                    //给图像加裁切效果
                    $('#cropbox').Jcrop({
                        onChange: updatePreview,   //选框改变时的事件
                        aspectRatio:scale,          //选框宽高比
                        onSelect: updateCoords,  //选框选定时的事件
                        bgFade:true,            //不使用背景过渡效果
                        arrowResize:true,
                        bgOpacity: .4,
                        setSelect: [setx,sety,setx2,sety2],   //创建裁剪选框的初始位置
                        boxWidth:350,
                        //maxSize:[realw,realh],
                        boxHeight:Math.round(realh/scaling)
                    },function(){
                        jcrop_api = this;
                        /*var real = jcrop_api.getBounds();
                         $("#cropw").val(real[0]);
                         $("#croph").val(real[1]);*/

                    });
                }
                //oImg.src = personpic_url+"?number="+Math.random();
                oImg.src = personpic_url;
            },

            error:function()
            {
                alert('出错!');
            }
        });
    }

    function creatImg()
    {
        var creatImg = "<img id='cropbox'/>";
        $("#cropbox").remove();
        $(".jcrop-holder").remove();
        $(".crop_pic").append(creatImg);
    }
    $('#edit_compic .uppic_cancel ').click(function(){
        $('#edit_compic').hide();
        $('#popup_mask').hide();
        jcrop_api.setImage(image_url);
        creatImg();
    });

    $('.closebox .clos ').click(function(){
        $('#edit_compic').hide();
        $('#popup_mask').hide();
        creatImg();
    });

    $('#edit_compic .uppic_ok').click(function(){
        $('#edit_compic').hide();
        $('#popup_mask').hide();
        creatImg();
    });
    $("#uppic_ok").on("click",function(){

        $.post("/products/pic_upload_to_crop",
            {cropx:$('#cropx').val(),cropy:$('#cropy').val(),cropw:$('#cropw').val(),croph:$('#croph').val(),pic_type:$this.attr('pic_type'),pic_id:$this.attr('p_id')},
            function(data, textStatus){
                if(data.success){
                    if($this.attr('pic_type')=="Product"){
                        $.post("/products/pic_upload_to_qiniu",
                            {product_id:$this.attr('p_id')},
                            function(data,textStatus){
                                location.reload();
                            });
                    }else{
                        $this.attr('src',data.message);
                        //jcrop_api.release();
                    }

                }

            }
        )

    });

    $('#uppic_ok_new').click(function(){
        $('.imgbox #edita').attr('src',image_url);
    });

    $('#personpic').change(function(){
        $('#picform').ajaxSubmit({
            dataType: "json",
            data:{pic_id: $this.attr('p_id'),pic_type:$this.attr('pic_type')},
            success:function(data)
            {
                //console.log(data.url);
                var oImg = new Image();
                oImg.onload = function()
                {
                    realw = this.width;
                    realh = this.height;
                    scaling = realw/350;
                    var resetx = Math.round(60*scaling);
                    var resety = Math.round(setYVal*scaling);
                    var resetx2 = Math.round(300*scaling);
                    var resety2 = Math.round(setYVal2*scaling);
                    $('#cropbox')[0].src = this.src;
                    $('#crop_view01')[0].src = this.src;
                    $('#crop_view02')[0].src = this.src;

                    //改变裁切图片
                    jcrop_api.setImage(this.src);
                    jcrop_api.setOptions({
                        aspectRatio:scale,
                        onSelect: updateCoords,
                        boxWidth:350,
                        boxHeight:Math.round(realh/scaling),
                        //boxHeight:realh,
                        bgOpacity: .4,
                        setSelect: [resetx,resety,resetx2,resety2]  //设置一个初选框的位置
                    });
                }
                oImg.src =data.url;
            },
            error: function(data){console.log(data,1111)}
        });

    });
    //调整浏览图位置和大小
    function updatePreview(c)
    {
        var scaling2 = 240/c.w;
        var scaling3 = 180/c.w;

        $('#crop_view01').css({
            width:Math.round(realw*scaling2)+'px',
            height:Math.round(realh*scaling2)+'px',
            left:'-'+Math.round(c.x*scaling2)+'px',
            top:'-'+Math.round(c.y*scaling2)+'px'
        });

        $('#crop_view02').css({
            width:Math.round(realw*scaling3)+'px',
            height:Math.round(realh*scaling3)+'px',
            left:'-'+Math.round(c.x*scaling3)+'px',
            top:'-'+Math.round(c.y*scaling3)+'px'
        });
    }

    //设置图片提交表单的数值  //<img id="cropbox" />
    function updateCoords(c)
    {
        $('#cropx').val(Math.round(c.x));   //距画布顶点的x坐标
        $('#cropy').val(Math.round(c.y));
        $('#cropw').val(Math.round(c.w));
        $('#croph').val(Math.round(c.h));
    }
    function clearInfo()
    {
        $("#cropw").val("");
        $("#croph").val("");
    }
});