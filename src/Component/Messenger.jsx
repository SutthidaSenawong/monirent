'use client';
import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';

export default function Messenger() {
  return (
    <div>
      <FacebookProvider appId="1169080330965804" chatSupport>
        <CustomChat pageId="280517075156100" minimized={true} />
      </FacebookProvider>
    </div>
  );
}
