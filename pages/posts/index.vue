<script setup lang="ts">
	definePageMeta({
		middleware: [
			() => {
				return navigateTo('/')
			}
		]
	})
</script>
