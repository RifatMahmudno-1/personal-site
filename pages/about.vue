<template>
	<div class="grid gap-4">
		<div class="bg-cyan-100 p-4 rounded">
			<div class="grid grid-cols-[auto_auto] justify-evenly mb-4 gap-4">
				<h1 class="self-center text-3xl font-bold">
					Hi There! <br />
					My name is Rifat Mahmud
				</h1>
				<img src="/images/profile_logo.png" class="border-2 border-cyan-300 rounded-full aspect-square object-center object-cover p-2 w-[10rem]" />
			</div>
			<ul class="bg-cyan-200 rounded list-inside list-disc p-4">
				<li>I'm a self learnt full stack web developer.</li>
				<li>If you need help, contact me. I'll be glad if I can help you.</li>
				<li>I'm always open to new ideas and opportunities.</li>
			</ul>
		</div>

		<div class="bg-cyan-100 p-4 rounded">
			<h2 class="w-fit mx-auto mb-4 border-b-2 px-4 border-cyan-300 font-semibold text-lg">Contact and Social Media</h2>
			<div class="grid gap-2">
				<div class="grid grid-cols-[4rem_1fr] gap-4 bg-cyan-300 rounded p-4 items-center">
					<img src="/images/discord_logo.png" class="aspect-square object-contain object-center" />
					<div>
						<p>Discord</p>
						<a class="underline" target="_blank" href="https://discord.com/users/715938370840166433">https://discord.com/users/715938370840166433</a>
					</div>
				</div>
				<div class="grid grid-cols-[4rem_1fr] gap-4 bg-cyan-300 rounded p-4 items-center">
					<img src="/images/github_logo.png" class="aspect-square object-contain object-center" />
					<div>
						<p>Github</p>
						<a class="underline" target="_blank" href="https://github.com/RifatMahmudno-1">https://github.com/RifatMahmudno-1</a>
					</div>
				</div>
				<div class="grid grid-cols-[4rem_1fr] gap-4 bg-cyan-300 rounded p-4 items-center">
					<img src="/images/gmail_logo.png" class="aspect-square object-contain object-center" />
					<div>
						<p>Email</p>
						<a class="underline" target="_blank" href="mailto:rifatmahmudpc@gmail.com">rifatmahmudpc@gmail.com</a>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-cyan-100 p-4 rounded">
			<h2 class="w-fit mx-auto mb-4 border-b-2 px-4 border-cyan-300 font-semibold text-lg">About this website</h2>
			<ul class="bg-cyan-200 rounded list-inside list-disc p-4">
				<li>This is my personal website.</li>
				<li>Here I'll post blogs on many topics and updates of my other projects.</li>
				<li>This website is created using NuxtJS, uses mongodb database and hosted on vercel.</li>
				<li>Most of the images of this website is hosted on imgur.</li>
			</ul>
		</div>
	</div>
</template>
