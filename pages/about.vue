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
				<div class="grid grid-cols-[4rem_1fr] gap-4 bg-cyan-300 rounded p-4 items-center" v-for="social in socials">
					<img :src="social.image_url" class="aspect-square object-contain object-center" />
					<div>
						<p>{{ social.title }}</p>
						<a class="underline" target="_blank" :href="social.link">{{ social.linkText }}</a>
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

<script setup lang="ts">
	useHead({
		title: `About - Rifat Mahmud`
	})

	const socials = ref([
		{
			title: 'Discord',
			link: 'https://discord.com/users/715938370840166433',
			linkText: 'https://discord.com/users/715938370840166433',
			image_url: '/images/discord_logo.png'
		},
		{
			title: 'Github',
			link: 'https://github.com/RifatMahmudno-1',
			linkText: 'https://github.com/RifatMahmudno-1',
			image_url: '/images/github_logo.png'
		},
		{
			title: 'Email',
			link: 'mailto:rifatmahmudpc@gmail.com',
			linkText: 'rifatmahmudpc@gmail.com',
			image_url: '/images/gmail_logo.png'
		}
	])
</script>
