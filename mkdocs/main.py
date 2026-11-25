import os
import requests

def define_env(env):

	def load_example(path):
		# Try a local checkout of the epsilon repo, expected as a sibling of the epsilon-website repo
		local_examples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "epsilon", "examples")
		try:
			with open(os.path.join(local_examples_dir, path), encoding="utf-8") as f:
				return f.read()
		except OSError:
			remote_examples_url = "https://raw.githubusercontent.com/eclipse-epsilon/epsilon/main/examples/"
			return requests.get(remote_examples_url + path).text

	@env.macro
	def example(url, tabs=False):
		text = load_example(url)
		if tabs:
			return '\t'.join(text.splitlines(True))
		else:
			return text
