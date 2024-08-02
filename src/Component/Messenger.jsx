import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';

export default function Messenger() {
  return (
    <div>
      <FacebookProvider appId="1164835841429130" chatSupport>
        <CustomChat pageId="280517075156100" minimized={true} />
      </FacebookProvider>
    </div>
  );
}
