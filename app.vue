<template>
	<NuxtPwaManifest />
	<NuxtRouteAnnouncer />
	<div>
		<NuxtLayout />
		<Footer />
	</div>
	<Notification />
</template>

<script setup lang="ts">
	useHead({
		title: 'Rifat Mahmud'
	})
</script>
