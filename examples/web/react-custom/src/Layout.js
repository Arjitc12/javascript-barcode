import React from 'react';
import "./Layout.css";
import {Icon} from 'antd';
import SettingPage from './SettingPage';
import FilePage from './FilePage';
import Scanner from "./Scanner";

function RegionBtn(props){
    return(
        <label className="region" onClick={props.handleRegion}>
            <Icon type={props.isFullRegion?"fullscreen-exit":"fullscreen"} style={{fontSize:"2rem",color:"#FE8E14"}}></Icon>
        </label>
    )
}

function ScannerArea(props){
    return(
        <div className="scanner-container">
            <div className="frame" style={{width:props.region+"%",height:props.region+"%",maxWidth:"250px",maxHeight:"250px"}}>
                <label className="flashlight">
                    <Icon type="funnel-plot" style={{fontSize:"2rem",color:"#FE8E14"}}></Icon>
                </label>
            </div>
            <div className="tip-info">
                <p>Put the code in the box and scan it automatically.</p>
            </div>
        </div>
    )
}



class Body extends React.Component{
    constructor(props){
        super(props);
        this.state=({
            isFullRegion:false,
        })
    }

    handleRegion(){
        this.setState({
            isFullRegion:!this.state.isFullRegion,
        })
    }


    render(){
        var regionSize = 60;
        return (
            <div className="home-screen">
                <Scanner region={regionSize} isFullRegion={this.state.isFullRegion}></Scanner>
                {
                    !this.state.isFullRegion&&
                    <ScannerArea region={regionSize}></ScannerArea>
                }
                <div className="dynam-info">
                    {/* <p>Dynamsoft DBR</p> */}
                    <a href="https://www.dynamsoft.com" ><img src="img/logo-dynamsoft-blackBg-190x47.png" alt="logo"></img></a>
                </div>
                
                <RegionBtn handleRegion={this.handleRegion.bind(this)} isFullRegion={this.state.isFullRegion}></RegionBtn>
            </div>
        )
    }
}

let clicks = [];
let timeout;

class Head extends React.Component{
    constructor(props){
        super(props);
        this.state=({
            isShowSettingPage:false,
            isShowFilePage:false,
            isFullScreen:false,
            isFullRegion:false,
        })
    }

    handleRegion(){
        this.setState({
            isFullRegion:!this.state.isFullRegion,
        })
    }

    handleShowSettingPage(){
        this.setState({
            isShowSettingPage:!this.state.isShowSettingPage,
        });
    }

    handleShowFilePage(){
        this.setState({
            isShowFilePage:!this.state.isShowFilePage,
        });
    }

    switchFullScreen(){
        if(!this.state.isFullScreen){
            if(document.documentElement.requestFullscreen){
                document.documentElement.requestFullscreen();
            }
            else if(document.documentElement.webkitRequestFullScreen){
                document.documentElement.webkitRequestFullScreen();
            }
            else if(document.documentElement.mozRequestFullScreen){
                document.documentElement.mozRequestFullScreen();
            }
            else{
                document.documentElement.msRequestFullscreen();
            }
            //document.documentElement.requestFullscreen(); 
        }
            
        else
            document.exitFullscreen();
        this.setState({
            isFullScreen:!this.state.isFullScreen,
        })       
    }

    fullSceenClickHandler(event){
        event.preventDefault();
        clicks.push(new Date().getTime());
        window.clearTimeout(timeout);
        timeout = window.setTimeout(()=>{
            if (clicks.length > 1 && clicks[clicks.length - 1] - clicks[clicks.length - 2] < 250){
                this.switchFullScreen();
            }
        },250);
    }   

    render(){
        if(this.state.isShowSettingPage){
            return(
                <>
                <SettingPage
                onBackClick={this.handleShowSettingPage.bind(this)}
                >
                </SettingPage>
                </>
            )
        }

        if(this.state.isShowFilePage){
            return(
                <>
                <FilePage onBackClick={this.handleShowFilePage.bind(this)}></FilePage>
                </>
            )
        }
        else{
            return(
                <>
                <div className="settingBtn-container" >
                    <Icon type="setting" style={{fontSize:"2.5rem",color:"#FE8E14"}} onClick={this.handleShowSettingPage.bind(this)} ></Icon>
                </div>
                <div className="double-click" >
                    <label onClick={this.fullSceenClickHandler.bind(this)}>双击{this.state.isFullScreen&&"退出"}全屏</label>
                </div>
                <div className="selImgBtn-container">
                    <Icon type="plus" style={{fontSize:"2.5rem",color:"#FE8E14"}} onClick={this.handleShowFilePage.bind(this)}></Icon>
                </div>
                </>
            )
        }
    }
    
}




class Layout extends React.Component{
    constructor(props){
        super(props);
        this.state=({
            isOpen:false,
            isShow:true,
        })
    }

    handleShow(){
        this.setState({
            isShow:!this.state.isShow,
        });
        console.log(this.state.isShow);
    }

    render(){
        return (
            <div className="wrap-container">
                {
                    this.state.isShow&&
                    <>
                        <Body></Body>
                        <Head></Head>
                    </>
                }
                
            </div>
        )
    }
}


export default Layout;
