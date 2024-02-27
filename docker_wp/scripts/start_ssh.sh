#!/bin/bash

# only run sshd if SSH_ENABLE is non-empty and /usr/sbin/sshd exists
if [ -n "$SSH_ENABLE" ] && [ -x /usr/sbin/sshd ]; then
  echo "Starting SSH..."
  
  chmod -R 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
  chown root:root -R ~/.ssh

  /usr/sbin/sshd -E /var/log/sshd.log -D
fi

sleep 86400