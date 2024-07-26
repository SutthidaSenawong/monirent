'use client';
import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';
// import ReactDOM from 'react-dom';
// import MessengerCustomerChat from 'react-messenger-customer-chat';

export default function Messenger() {
  return (
    <div>
      {/* <MessengerCustomerChat
        pageId="280517075156100"
        appId="1169080330965804"
      /> */}
      <FacebookProvider appId="1169080330965804" chatSupport>
        <CustomChat pageId="280517075156100" minimized={true} />
      </FacebookProvider>
    </div>
  );
}
