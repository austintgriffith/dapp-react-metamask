import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import logo from './metamask.png';
import Blockies from 'react-blockies';
let defaultConfig = {}
defaultConfig.DEBUG = false;
defaultConfig.POLLINTERVAL = 377
defaultConfig.showBalance = true
defaultConfig.hideNetworks = [
  "Mainnet"
]
defaultConfig.accountCutoff = 10
defaultConfig.outerBoxStyle = {
  float:'right'
}
defaultConfig.ETHPRECISION = 10000
defaultConfig.boxStyle = {
  paddingRight:75,
  marginTop:3,
  paddingTop:7,
  zIndex:10,
  fontWeight:'bold',
  color:"#222",
  textAlign:"right",
  width:200
}
defaultConfig.textStyle = {
  fontSize: 22
}
defaultConfig.warningStyle = {
  fontSize: 16
}
defaultConfig.blockieStyle = {
  size: 6,
  top: 10,
  right: 15
}
defaultConfig.requiredNetwork = [
  "Mainnet",
  "Unknown"//allow local RPC for testing
]
class Metamask extends Component {
  constructor(props) {
    super(props);
    let config = defaultConfig
    if(props.config) {
      config = deepmerge(config, props.config)
    }
    this.state = {
      status:"loading",
      network:0,
      account:0,
      etherscan:"",
      config: config
    }
  }
  componentDidMount(){
    setInterval(this.checkMetamask.bind(this),this.state.config.POLLINTERVAL)
    this.checkMetamask()
  }
  checkMetamask() {
    if(this.state.config.DEBUG) console.log("METAMASK - checking state...")
    if (typeof window.web3 == 'undefined') {

      if(this.state.status=="loading"){
        if(this.state.config.DEBUG) console.log("METAMASK - no web3")
        this.setState({status:"noweb3"},()=>{this.props.onUpdate(this.state)})
      }else if(this.state.status!="noweb3"){
        if(this.state.config.DEBUG) console.log("METAMASK - lost web3")
        window.location.reload(true);
        this.setState({status:"error"},()=>{this.props.onUpdate(this.state)})
      }
    } else {
      if(this.state.config.DEBUG) console.log("METAMASK - yes web 3")
      window.web3.version.getNetwork((err,network)=>{
        if(this.state.config.DEBUG) console.log("METAMASK - network",network)
        network = translateNetwork(network);
        if(this.state.config.DEBUG) console.log("METAMASK - translated network",network)
        let accounts
        try{
          window.web3.eth.getAccounts((err,_accounts)=>{
            if(this.state.config.DEBUG) console.log("METAMASK - accounts",_accounts)
            if(_accounts&&this.state.account&&this.state.account!=_accounts[0]){
              window.location.reload(true);
            }
            if(err){
              console.log("metamask error",err)
              if(this.state.status!="error") this.setState({status:"error",network:network},()=>{this.props.onUpdate(this.state)})
            }else{
              if(!_accounts){
                if(this.state.status!="error") this.setState({status:"error",network:network},()=>{this.props.onUpdate(this.state)})
              } else if(_accounts.length<=0){
                if(this.state.status!="locked") this.setState({status:"locked",network:network},()=>{this.props.onUpdate(this.state)})
              } else{
                window.web3.eth.getBlockNumber((err,block)=>{
                  window.web3.eth.getBalance(""+_accounts[0],(err,balance,e)=>{
                    balance=balance.toNumber()/1000000000000000000
                    let etherscan="https://etherscan.io/"
                    if(network){
                      if(network=="Unknown"||network=="private"){
                        etherscan = "http://localhost:8000/#/"
                      }else if(network!="Mainnet"){
                        etherscan = "https://"+network.toLowerCase()+".etherscan.io/"
                      }
                    }
                    if(this.state.config.DEBUG) console.log("METAMASK - etherscan",etherscan)
                    if(this.state.status!="ready"||this.state.block!=block||this.state.balance!=balance) {
                      this.setState({status:"ready",block:block,balance:balance,network:network,etherscan:etherscan,account:_accounts[0]},()=>{this.props.onUpdate(this.state)})
                    }
                  })
                })

              }
            }
          })
        }catch(e){
          console.log(e)
          if(this.state.metamask!=-1) this.setState({metamask:-1,network:network})
        }
      })
    }
  }
  render(){
    let metamask = "loading."
    if(this.state.status=="loading"){
      metamask = (
        <a target="_blank"  href="https://metamask.io/">
        <span style={this.state.config.textStyle}>
          loading...
        </span>
        <img style={{maxHeight:45,padding:5,verticalAlign:"middle"}}
        src={logo}
        />
        </a>
      )
    }else if(this.state.status=="noweb3"){
      let mmClick = ()=>{
        window.open('https://metamask.io', '_blank');
      }
      metamask = (
        <div style={{zIndex:999999}} onClick={mmClick}>
          <a target="_blank" href="https://metamask.io/">
          <span style={this.props.warningStyle}>
            Install MetaMask to play
          </span>
          <img style={{maxHeight:45,padding:5,verticalAlign:"middle"}}
          src={logo}
          />
          </a>
        </div>
      )
    } else if(this.state.status=="locked"){
      metamask = (
        <div>
          <span style={this.state.config.warningStyle}>
              Unlock MetaMask to play
          </span>
          <img style={{maxHeight:45,padding:5,verticalAlign:"middle"}}
            src={logo}
          />
        </div>
      )
    } else if(this.state.status=="error"){
      metamask = (
        <div>
        <span style={this.state.config.warningStyle}>
          Error Connecting
        </span>
        <img style={{maxHeight:45,padding:5,verticalAlign:"middle"}}
         src="metamaskhah.png"
        />
        </div>
      )
    } else if(this.state.status=="ready"){

        let requiredNetworkText = ""
        for(let n in this.state.config.requiredNetwork){
          if(this.state.config.requiredNetwork[n]!="Unknown"){
            if(requiredNetworkText!="") requiredNetworkText+="or "
            requiredNetworkText+=this.state.config.requiredNetwork[n]+" "
          }
        }
        if(this.state.config.requiredNetwork&&this.state.config.requiredNetwork.indexOf(this.state.network)<0){
             metamask = (
               <div>
                 <span style={this.state.config.warningStyle}>
                    Please switch network to {requiredNetworkText}
                 </span>
                 <img style={{maxHeight:45,padding:5,verticalAlign:"middle"}}
                   src={logo}
                 />
               </div>
             )
         }else{
           let network = this.state.network
           if(this.state.config.hideNetworks.indexOf(network)>=0) network=""
           let balance = ""
           if(this.state.config.showBalance){
             balance = Math.round(this.state.balance*this.state.config.ETHPRECISION)/this.state.config.ETHPRECISION
           }
           metamask = (
             <div style={this.state.config.boxStyle}>
               <a target="_blank" href={this.state.etherscan+"address/"+this.state.account}>
                 <div>
                   <span style={this.state.config.textStyle}>
                     {this.state.account.substr(0,this.state.config.accountCutoff)}
                   </span>
                 </div>
                 <div>
                   <span style={this.state.config.textStyle}>
                     {network} {balance}
                   </span>
                 </div>
                 <div style={{position:"absolute",right:this.state.config.blockieStyle.right,top:this.state.config.blockieStyle.top}} onClick={this.clickBlockie}>
                   <Blockies
                   seed={this.state.account}
                   scale={this.state.config.blockieStyle.size}
                   />
                 </div>
               </a>
             </div>
           )
         }
    }else{
      metamask = "error unknown state: "+this.state.status
    }
    return (
      <div style={this.state.config.outerBoxStyle}>
        {metamask}
      </div>
    )
  }
}
export default Metamask;
function translateNetwork(network){
  if(network==5777){
    return "Private";
  }else if(network==1){
    return "Mainnet";
  }else if(network==2){
    return "Morden";
  }else if(network==3){
    return "Ropsten";
  }else if(network==4){
    return "Rinkeby";
  }else if(network==42){
    return "Kovan";
  }else{
    return "Unknown";
  }
}
