import React, { useEffect, useState } from 'react';
import './App.css';
import jwt_decode from "jwt-decode";
import axios from "axios";

function App() {

  // 프로바이더 별로 redir url에 쿼리를 붙이기.
  const googleClientId: string = '35083665359-q1p5ud9fnkct1hlecqpt6pr6f9nsigrh.apps.googleusercontent.com';

  const ftClientID: string = "u-s4t2ud-66d68bdf5685567de8feb6a887e3d14a36f6a8f9885f48edef2f17a74f349d18";
  const ftClientSecret: string = "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"
  const ftLoginUrl: string = `https://api.intra.42.fr/oauth/authorize?client_id=${ftClientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code`

  const [googleUser, setGoogleUser] = useState<any>(null);
  const [ftUser, setFtUser] = useState<any>(null);

  function handleGoogleCallbackResponse(response: any) {
    console.log("encoded JWT ID token: " + response.credential);
    const googleUserObject = jwt_decode(response.credential);
    console.log(googleUserObject);
    setGoogleUser(googleUserObject);
    // document.getElementById('googleSignInDiv')!.hidden = true;
  }

  function ftLogin() {
    window.location.href = ftLoginUrl;
  }

  function handleGoogleSignOut(event: any) {
    setGoogleUser(null);
    // document.getElementById('googleSignInDiv')!.hidden = false;
  }

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      console.log("code: " + code);
      axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: ftClientID,
        client_secret: ftClientSecret,
        code: code,
        redirect_uri: 'http://localhost:3000'
      }).then((response) => {
        console.log(response.data);
        axios.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`
          }
        }).then((response) => {
          console.log(response.data);
          setFtUser(response.data);
        }).catch((error) => {
          console.log(error);
        });
      }).catch((error) => {
        console.log(error);
      })
    }
  /* global google */
    // @ts-ignore
    // ts ignore is required for global objects loaded form html
    google.accounts.id.initialize(
        {
          client_id: googleClientId,
          callback: handleGoogleCallbackResponse,
        }
    );

    // @ts-ignore
    google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
    );

  },[]);

  return (
    <div className="App">
      <div id="googleSignInDiv"></div>
      <div id="42SignInDiv">
        <button onClick={ftLogin}>42 Login</button>
      </div>
      <button onClick={(e) => handleGoogleSignOut(e)}>Google Sign Out</button>
      { googleUser &&
        <div>
          <img src={googleUser.picture} alt="googleUser profile" />
          <h3>{googleUser.name}</h3>
          <p>{googleUser.email}</p>
          <p>{googleUser.sub}</p>
        </div>
      }
      { ftUser &&
          <div>
            <h3>{ftUser.id}</h3>
            <p>{ftUser.login}</p>
            <p>{ftUser.email}</p>
            <p>{ftUser.first_name}</p>
            <p>{ftUser.last_name}</p>
            <img width="100px"  src={ftUser.image.link} alt="ftUser profile" />
          </div>
      }
    </div>
  );
}

export default App;
