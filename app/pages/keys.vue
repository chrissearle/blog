<template>
  <UContainer>
    <Head>
      <Title>Cryptographic Keys</Title>
    </Head>

    <h1 class="pageTitle">Cryptographic Keys</h1>

    <h2 class="sectionTitle">Current</h2>

    <p class="mb-2">Get the public keys direct from the keyservers.</p>

    <p class="mb-2">
      You can also check the proofs on my
      <a
        href="https://keyoxide.org/116FBA8295065A01C3BC7CC6CF79BF54D4BF0A41"
        target="_blank"
        rel="noopener noreferer"
      >
        keyoxide profile.
      </a>
    </p>

    <h3 class="subSectionTitle">Work (BB80AB21)</h3>

    <div class="fingerprint">
      <pre>Fingerprint: FF6E 6FFA C4CB 0727 38D0 E1EB 4E5F 28B9 BB80 AB21</pre>
    </div>

    <h3 class="subSectionTitle">Private (D4BF0A41)</h3>

    <div class="fingerprint">
      <pre>Fingerprint: 116F BA82 9506 5A01 C3BC 7CC6 CF79 BF54 D4BF 0A41</pre>
    </div>

    <p class="mb-2">
      These replace the older two keys and are both using a larger key size and
      SHA-256 instead of SHA-1.

      <a
        href="http://ekaia.org/blog/2009/05/10/creating-new-gpgkey/"
        target="_blank"
        rel="noopener noreferer"
        >This blog post by Ana Beatriz Guerrero López</a
      >
      was very clear on how to generate these new keys.
    </p>

    <h2 class="sectionTitle">Outdated</h2>

    <h3 class="subSectionTitle">Outdated</h3>

    <p class="mb-2">
      These keys are no longer in use - but are published to help showing the
      history
    </p>

    <h3 class="subSectionTitle">Work (83C1EAEB)</h3>

    <p class="mb-2">Replaced by BB80AB21</p>

    <div class="fingerprint">
      <pre>Fingerprint: 0D89 45A9 A5CD 15C4 FF77 7D8D 8FEA 08A2 83C1 EAEB</pre>
    </div>

    <h3 class="subSectionTitle">Home/Scouts (224A5434)</h3>

    <p class="mb-2">Replaced by D4BF0A41</p>

    <div class="fingerprint">
      <pre>Fingerprint: A4AE 46C6 EA6C DD12 CC57 623F BF50 786C 224A 5434</pre>
    </div>
  </UContainer>
</template>
