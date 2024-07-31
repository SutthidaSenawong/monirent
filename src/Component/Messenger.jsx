import React, { useEffect } from 'react';

export default function Messenger() {
  useEffect(() => {
    const loadFBChat = () => {
      const d = document;
      const s = 'script';
      const id = 'facebook-jssdk';
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
      fjs.parentNode.insertBefore(js, fjs);
    };

    // Load Facebook Chat SDK
    loadFBChat();

    // Initialize FB
    window.fbAsyncInit = function () {
      FB.init({
        appId: '1169080330965804',
        xfbml: true,
        version: 'v20.0',
      });
    };
  }, []);

  return (
    <div>
      <div
        className="fb-customerchat"
        attribution="setup_tool"
        page_id="280517075156100"
        theme_color="#6699cc"
        logged_in_greeting="Hi! How can we help you?"
        logged_out_greeting="Thanks!"
      ></div>
    </div>
  );
}
