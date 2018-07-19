# dapp-react-metamask
MetaMask react component for rapid dapp development

## usage

```
import Metamask from "dapp-react-metamask"

<Metamask
  onUpdate={(state)=>{
    console.log("metamask state update:",state)
  }}
/>
```

## config
```
<Metamask
  config={{
    DEBUG:false,
    POLLINTERVAL:377,
    showBalance:true,
    hideNetworks:[
      "Mainnet"
    ],
    accountCutoff:10,
    outerBoxStyle:{
      float:'right'
    },
    ETHPRECISION:10000,
    boxStyle:{
      paddingRight:75,
      marginTop:3,
      paddingTop:7,
      zIndex:10,
      fontWeight:'bold',
      color:"#222",
      textAlign:"right",
      width:200
    },
    textStyle:{
      fontSize: 22
    },
    warningStyle:{
      fontSize: 16
    },
    blockieStyle:{
      size: 6,
      top: 10,
      right: 15
    },
    requiredNetwork:[
      "Mainnet",
      "Unknown"//allow local RPC for testing
    ]
  }}
  onUpdate={(state)=>{
    console.log("metamask state update:",state)
  }}

/>
```

---

# Dev

## build

```
npm run build
```

## linking

```
npm i
npm link
```

then in your app dir:
```
npm link dapp-react-metamask
```
