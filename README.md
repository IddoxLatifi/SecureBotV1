<h1 align="center">Discord Security Bot V1</h1>

<p align="center" style="font-family: Arial, sans-serif; line-height: 1.6;">
  This bot secures your server better than any other.<br><br>
  With Docker synchronization, a Redis database, and Hammertime integrations, our unique grab system immediately kicks bots created by other users – and a beautiful interface, this bot is 100% different from others.<br><br>
  I'm pleased to introduce you to my first real bot.<br><br>
  <strong>Discord:</strong> 
  <a href="https://discord.gg/KcuMUUAP5T" target="_blank" 
     style="display: inline-block; padding: 10px 20px; background-color: #7289DA; color: #fff; border-radius: 5px; text-decoration: none; font-weight: bold;">
    Join our Discord Server
  </a><br><br>
  It is and remains 100% free!
</p>

<div align="center">
  <img height="450" src="https://cdn.discordapp.com/attachments/1283833775507374211/1349813358483869706/Unbenannt.PNG?ex=67d47726&is=67d325a6&hm=0bddbbfc87cde3f3e0ec94f440d55c2c289b1d259cba3dfccb0d742fb0752312&"  />
</div>

<h2 align="center">Requirements</h2>

<p align="center">
  ❌ Docker <br>
  ❌ JavaScript <br>
  ❌ Node.js v22.14.0 <br>
</p>
<h2 align="center">Functions</h2>

<ul>
  <li><strong>Interface Menu</strong>:
    <ul>
      <li>-> <strong>Anti Spam</strong>: delete spam instantly and mute the Member.</li>
      <li>-> <strong>Anti Invite Link</strong>: delete invite links instantly and mute the Member.</li>
      <li>-> <strong>Anti Raid</strong>: sets a join maximum in a certain time to prevent raids.</li>
      <li>-> <strong>Anti Greif</strong>: checks if someone tries to invite a Bot on the Server, kicks the Bot instantly and mutes the Member.</li>
      <li>-> <strong>Anti Ghost Ping</strong>: checks if a Member pings someone and deletes the Message.</li>
    </ul>
  </li>
  <li><strong>Slash Commands</strong>:
    <ul>
      <li>-> <strong>/anti_nuke</strong> - Checks server settings for correctness and reports if something is wrong.</li>
      <li>-> <strong>/delete</strong> - Delete all Messages of a Member.</li>
      <li>-> <strong>/mute</strong> - Mute a Member.</li>
      <li>-> <strong>/info</strong> - Get info about a Member.</li>
      <li>-> <strong>/dblog</strong> - Get redis Log from Users.</li>
    </ul>
  </li>
</ul>

<p>
  All <strong>MODERATOR_ID</strong> in the <strong>.env</strong> have access to the Slash commands! Only put People in there you can trust!
</p>

<h1 align="center">How to Install</h1>

<h4 align="left">
  1. Node.js und npm installieren: <br>
  Lade <a href="https://nodejs.org/en/download" target="_blank">Node.js</a> hier herunter und installiere es – npm wird automatisch mitinstalliert.<br><br>
  2. Git installieren: <br>
  Lade Git von <a href="https://git-scm.com" target="_blank">git-scm.com</a> herunter und installiere es, falls du es noch nicht hast.<br><br>
  3. Docker installieren:<br>
  Falls du Redis per Docker nutzen möchtest, installiere <a href="https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module" target="_blank">Docker Desktop</a> (für Windows)
</h4>

<h3 align="center">Start the Bot</h3>

<ul>
  <li>
    <strong>git clone</strong> https://github.com/IddoxLatifi/SecureBotV1.git
  </li>
  <li>
    First of all, rename the <strong>.env_temp</strong> to <strong>.env</strong> and fill it with your information.
  </li>
  <li>
    After that, install the required packages:
    <ul>
      <li><strong>npm install</strong></li>
      <li><strong>node deploy-commands.js</strong></li>
    </ul>
  </li>
  <li>
    If you have successfully completed these steps and the bot has not detected any problems with your bot settings, you can start Docker.
  </li>
  <li>
    Use <strong>docker-compose up --build</strong> to build and start the Docker containers.
  </li>
  <li>
    Have fun with the bot :)
  </li>
</ul>


<h2 align="left">I code with</h2>

<div align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="40" alt="docker logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="40" alt="python logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg" height="40" alt="visualstudio logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="40" alt="css3 logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="git logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg" height="40" alt="rust logo"  />
</div>

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=IddoxLatifi&hide_title=false&hide_rank=false&show_icons=true&include_all_commits=true&count_private=true&disable_animations=false&theme=dracula&locale=en&hide_border=false&order=1" height="150" alt="stats graph"  />
  <img src="https://github-readme-stats.vercel.app/api/top-langs?username=IddoxLatifi&locale=en&hide_title=false&layout=compact&card_width=320&langs_count=5&theme=dracula&hide_border=false&order=2" height="150" alt="languages graph"  />
</div>
