import React from 'react';
import 'antd/dist/antd.css';
import {Icon,Spin,message,Button} from 'antd';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import './Layout.css'

class EachResult extends React.Component{
    copyScannerResult(){
        const kUtil=window.kUtil;
        kUtil.copyToClipBoard(this.props.content);
        var config={};
        config.content="copy successfully!";
        config.icon=<Icon type="smile" style={{color:"#FE8E14"}}></Icon>;
        message.config({
            top:window.innerHeight-180,
            duration:1.5,
        });
        message.open(config);
    }

    render(){
        let txt = this.props.content;
        let possibleLink = txt;
        if (!txt.startsWith('http') && (txt.startsWith('www') || -1 !== txt.indexOf('.com') ||
            -1 !== txt.indexOf('.net') || -1 !== txt.indexOf('.org') || -1 !== txt.indexOf('.edu'))) {
            possibleLink = 'http://' + txt;
        }
        let isLink = possibleLink.startsWith('http');
        return(
            <div className="result-content">
                <>
                    <><span style={{color:"#FE8E14"}}>{this.props.format}: </span></>
                    {
                        isLink?
                        <a href={possibleLink} target={"_blank"} style={{textDecoration:"underline"}} >{this.props.content}</a>
                        : <span onClick={this.copyScannerResult.bind(this)}>{this.props.content}</span>
                    }
                    <><span style={{color:"#FE8E14"}}> x {this.props.count}</span></>
                    {/* <Button type="link" icon="copy" size="small" style={{float:"right"}}  onClick={this.copyScannerResult.bind(this)}></Button> */}
                </>
            </div>
            )
        }
}


class Result extends React.Component{
    render(){
        const resultItems = this.props.resultsInfo.slice(-3).map((ri,index)=>
            <EachResult key={index} content = {ri.result.BarcodeText} count={ri.count} format={ri.result.BarcodeFormatString}></EachResult>
        );
        return(
            <div className="result-container">
                {resultItems}
            </div>
        )
    }
}


class Canvas extends React.Component{
    constructor(props){
        super(props);
        this.state=({
            isDraw:false
        });
        this.canvas = React.createRef();
    }

    componentDidUpdate(){
        let point = this.props.point;
        let x1 = point[0].split(',')[0];
        let y1 = point[0].split(',')[1];
        let x2 = point[1].split(',')[0];
        let y2 = point[1].split(',')[1];
        let x3 = point[2].split(',')[0];
        let y3 = point[2].split(',')[1];
        let x4 = point[3].split(',')[0];
        let y4 = point[3].split(',')[1];

        let leftMin = Math.min(x1, x2, x3, x4);
        //let rightMax = Math.max(x1, x2, x3, x4);
        let topMin = Math.min(y1, y2, y3, y4);
        //let bottomMax = Math.max(y1, y2, y3, y4);

        let _x1 = x1 - leftMin;
        let _x2 = x2 - leftMin;
        let _x3 = x3 - leftMin;
        let _x4 = x4 - leftMin;
        let _y1 = y1 - topMin;
        let _y2 = y2 - topMin;
        let _y3 = y3 - topMin;
        let _y4 = y4 - topMin;


        var canvas = this.canvas.current;
        if(canvas.getContext){
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = 'rgba(254,180,32,0.5)';
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.beginPath();
            ctx.moveTo(_x1, _y1);
            ctx.lineTo(_x2, _y2);
            ctx.lineTo(_x3, _y3);
            ctx.lineTo(_x4, _y4);
            ctx.fill();
        }

    }

    render(){
        let point = this.props.point;
        let x1 = point[0].split(',')[0];
        let y1 = point[0].split(',')[1];
        let x2 = point[1].split(',')[0];
        let y2 = point[1].split(',')[1];
        let x3 = point[2].split(',')[0];
        let y3 = point[2].split(',')[1];
        let x4 = point[3].split(',')[0];
        let y4 = point[3].split(',')[1];

        let leftMin = Math.min(x1, x2, x3, x4);
        let rightMax = Math.max(x1, x2, x3, x4);
        let topMin = Math.min(y1, y2, y3, y4);
        let bottomMax = Math.max(y1, y2, y3, y4);
        let cvsStyle={
            position:"absolute",
            left:leftMin+"px",
            top:topMin+"px",
            //background:"#80008021",
        };
        return(
            <>
            {
                <canvas
                ref={this.canvas}
                width={rightMax-leftMin} height={bottomMax-topMin} style={cvsStyle}>
                </canvas>
            }
            </>
            
        )
    }
}

const Dynamsoft = window.Dynamsoft;
let scanner = null;


class Scanner extends React.Component{
    constructor(props){
        super(props);
        this.state=({
            resultsInfo:[],
            isOpen:false,
            resultsPoint:[],
            camera:0,
            cameraList:0,
            isFullRegion:this.props.isFullRegion,
        })
    }



    showScanner(){
       
        var updateFrame = ()=>{
            var regionScale = 1.0*this.props.region/100;
            var regionWidth =  regionScale*window.innerWidth;
            var regionHeight = 0.5*regionScale*window.innerHeight;
    
            var r =scanner.getResolution();
            var vW = r[0];
            var vH = r[1];
            var left,right,top,bottom;
            if(vW>=window.innerWidth){      //resolution > screen width, mainly mobiles
                if(regionWidth>=250){
                    left = (window.innerWidth-regionWidth)/2/vW;
                    right = (window.innerWidth+regionWidth)/2/vW;
                    top = (vH-250)/2/vH;
                    bottom = (vH+250)/2/vH;
                }
                else{
                    left = (window.innerWidth-regionWidth)/2/vW;
                    right = (window.innerWidth+regionWidth)/2/vW;
                    top = (vH-regionHeight)/2/vH;
                    bottom = (vH+regionHeight)/2/vH;
                }
            }

            else if(vW<window.innerWidth){  //resolution > screen width, mainly pc
                if(regionWidth>=250){
                    left = (vW-250)/2/vW;
                    right = (vW+250)/2/vW;
                    top = (vH-250)/2/vH;
                    bottom = (vH+250)/2/vH;
                }
                else {
                    left = (vW-regionWidth)/2/vW;
                    right = (vW + regionWidth)/2/vW;
                    top = (vH-regionHeight)/2/vH;
                    bottom = (vH+regionHeight)/2/vH;
                }

            }

            let settings = scanner.getRuntimeSettings();

            if(!this.state.isFullRegion){
                settings.region.left = Math.round(left*100);
                settings.region.right = Math.round(right*100);
                settings.region.top = Math.round(top*100);
                settings.region.bottom = Math.round(bottom*100);
                settings.region.measuredByPercentage = 1; 
                scanner.updateRuntimeSettings(settings);
                //console.log(scanner.getRuntimeSettings());
            }
            else{
                settings.region.left = 0;
                settings.region.right = 100;
                settings.region.top = 0;
                settings.region.bottom = 100;
                settings.region.measuredByPercentage = 1; 
                scanner.updateRuntimeSettings(settings);
            }
        };

        Dynamsoft.BarcodeScanner.createInstance({
            intervalTime:200,
            UIElement:document.getElementById('scanner'),
            //videoSettings: { video: { width: { ideal: 1280 }, height: {ideal: 720 }, facingMode: { ideal: 'environment' } } },
            onFrameRead: results => {
                let resultPointsPerFrame=[];
                for (let i = 0; i < results.length; i++){
                    let result = results[i];
                    resultPointsPerFrame.push(result.LocalizationResult.ResultPoints);
                }

                let resultsInfo = scanner.arrDiffCodeInfo;
                this.setState({
                    resultsInfo:resultsInfo,
                    resultsPoint:resultPointsPerFrame,
                    isFullRegion:this.props.isFullRegion,
                });

                if(scanner!==null){
                    updateFrame();
                }
            },
            onUnduplicatedRead: (txt, result) => {
                console.log(result);
                
            }
        }).then(s => {
            scanner = s;
            if(scanner._isOpen===false){
                console.log("open!");
                scanner.open().then((paras)=>{
                    scanner.getAllCameras().then((cameras)=>{
                        this.setState({
                            cameraList:cameras
                        });
                        console.log(this.state.cameraList);
                        scanner.setCurrentCamera(cameras[this.state.camera].deviceId);
                    });
                    updateFrame();
                });
            }
            else{
                console.log("close!");
                scanner.show().then(()=>scanner.close());
            }
        }).then(()=>{
            this.setState({
                isOpen:!this.state.isOpen
            })
        })
    }

    componentDidMount(){
        this.showScanner();
    }

    componentWillUnmount(){
        this.showScanner();
    }

    handleFullRegion(){
        this.setState({
            isFullRegion:this.state.isFullRegion,
        })
    }
   
    onSwitchCamera(){
        scanner.getAllCameras().then(infos=>{
            var numOfCamera = this.state.cameraList.length;
            this.setState({
                camera:this.state.camera===numOfCamera-1?0:this.state.camera+1
            });
            return infos;
        }).then((infos)=>{
            var config={};
            config.content="Switch to camera "+infos[this.state.camera].label+" successfully!";
            config.icon=<Icon type="smile" style={{color:"#FE8E14"}}></Icon>;
            message.config({
                top:window.innerHeight-180,
                duration:1.5,
            });
            message.open(config);
            scanner.setCurrentCamera(infos[this.state.camera].deviceId);
        });
    }

    render(){
        const allCanvas = this.state.resultsPoint.map((eachResult,index)=>
            <Canvas key={index} point={eachResult}></Canvas>
        );
        return(
            <>
            <style type="text/css">
                {`
                .waiting{
                    position:absolute;
                    left:50%;
                    top:50%;
                    transform:translate(-50%);
                    color:#FE8E14;
                    transition: opacity 1000ms ease-in;
                }

                .fade-enter.fade-enter-active {
                    opacity:1;
                    transition: opacity 1000ms ease-in;
                }

                .fade-enter{
                    opacity:0;
                }

                .fade-leave{
                    opacity: 1; 
                }

                .fade-leave.fade-leave-active{
                    opacity:0;
                    transition: opacity 3000ms ease-in;
                }
                
                .fade-appear{
                    opacity:0;
                }

                .fade-appear.fade-appear-active {
                    opacity: 1;
                    transition: opacity 2000ms ease-in;
                }
                `}
            </style>
            <ReactCSSTransitionGroup
                transitionName="fade"
                transitionLeave={true}
                transitionAppear={false}
                transitionEnter={false}
                transitionAppearTimeout={500}
                transitionLeaveTimeout={3500}
                transitionEnterTimeout={2500}
            >
                {
                    !this.state.isOpen&&
                    <Spin 
                    className="waiting" 
                    tip="Accessing Camera list..." 
                    indicator={<Icon type="smile" spin style={{ fontSize: "3rem" ,}}></Icon>}>
                    </Spin>    
                }
            </ReactCSSTransitionGroup>           
            
            <div id='scanner' style={{position:"absolute",width:"100%"}}>
                <div className="video-container">
                    <video className='dbrScanner-video custom-video' playsInline={true}></video>
                {allCanvas}
                </div>

            </div>
            <Result resultsInfo={this.state.resultsInfo}></Result>
            {/* <button onClick={this.onSwitchCamera.bind(this)} style={{position:"absolute",top:"60px",left:0}}>切换相机</button> */}
            <Button type="primary" size="small" onClick={this.onSwitchCamera.bind(this)} style={{position:"absolute",top:"60px",left:0,backgroundColor:"rgb(254, 142, 20)",border:"0"}}>切换相机</Button>
            </>
        )
    }
}

export default Scanner;
